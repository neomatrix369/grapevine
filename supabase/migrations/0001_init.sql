-- Grapevine Step 1 init schema.
-- Do not apply until Supabase keys exist (see .env.local; never commit it).
-- Authored for Grapevine Step 1: channels, people, messages (fts + embedding),
-- rules, coverage, graph, my_posts, and hybrid RRF route_question().

create extension if not exists vector;

-- to_tsvector / generated tsvector need no extra extension.

-- ---------------------------------------------------------------------------
-- channels
-- ---------------------------------------------------------------------------
create table channels (
  platform text not null check (platform in ('slack', 'discord')),
  workspace text not null,
  channel_id text not null,
  channel_name text not null,
  topic text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (platform, channel_id)
);

-- ---------------------------------------------------------------------------
-- people
-- ---------------------------------------------------------------------------
create table people (
  person_id text primary key,
  display_name text not null,
  hidden boolean not null default false, -- privacy: omit from experts / graph
  last_active_at timestamptz,
  messages_4w integer not null default 0,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('slack', 'discord')),
  channel_id text not null,
  thread_id text,
  message_id text not null,
  author_person_id text references people (person_id) on delete set null,
  body text,
  ts timestamptz not null,
  url text,
  fts tsvector generated always as (to_tsvector('english', coalesce(body, ''))) stored,
  embedding vector(384),
  created_at timestamptz not null default now(),
  unique (platform, channel_id, message_id),
  foreign key (platform, channel_id) references channels (platform, channel_id)
);

create index messages_fts_gin on messages using gin (fts);

-- No IVFFlat vector index yet (small demo corpus). Add later if needed, e.g.:
-- create index messages_embedding_ivfflat
--   on messages using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index messages_author_idx on messages (author_person_id);
create index messages_thread_idx on messages (platform, channel_id, thread_id);

-- ---------------------------------------------------------------------------
-- rules
-- ---------------------------------------------------------------------------
create table rules (
  rule_id text primary key,
  platform text not null check (platform in ('slack', 'discord')),
  workspace text not null,
  scope text not null check (scope in ('community', 'channel')),
  channel_id text,
  source text,
  source_url text,
  text text not null,
  tags text[] not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (platform, channel_id) references channels (platform, channel_id)
);

-- ---------------------------------------------------------------------------
-- coverage (one row per channel)
-- ---------------------------------------------------------------------------
create table coverage (
  platform text not null check (platform in ('slack', 'discord')),
  channel_id text not null,
  oldest_read timestamptz,
  newest_read timestamptz,
  cutoff timestamptz,
  messages_read integer not null default 0,
  threads_read integer not null default 0,
  threads_skipped integer not null default 0,
  status text not null check (status in ('read', 'partial', 'unread')),
  oldest_covered_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (platform, channel_id),
  foreign key (platform, channel_id) references channels (platform, channel_id)
);

-- ---------------------------------------------------------------------------
-- graph (Cognee-shaped people / topics / channels / threads)
-- ---------------------------------------------------------------------------
create table graph_nodes (
  id text primary key,
  kind text not null check (kind in ('person', 'topic', 'channel', 'thread')),
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table graph_edges (
  src text not null references graph_nodes (id) on delete cascade,
  dst text not null references graph_nodes (id) on delete cascade,
  kind text not null,
  weight double precision not null default 1,
  created_at timestamptz not null default now(),
  primary key (src, dst, kind)
);

-- ---------------------------------------------------------------------------
-- my_posts
-- ---------------------------------------------------------------------------
create table my_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('question', 'announce')),
  text text not null,
  channel text,
  workspace text,
  at timestamptz not null default now(),
  source text not null check (source in ('grapevine', 'read')),
  tagged text[] not null default '{}',
  replies integer not null default 0,
  status text not null check (status in ('awaiting', 'answered', 'replied', 'no-reply')),
  answered_by text references people (person_id) on delete set null,
  reactions integer,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- route_question: hybrid keyword + vector Reciprocal Rank Fusion (k=60)
-- ---------------------------------------------------------------------------
create or replace function route_question(
  query_text text,
  query_embedding vector(384)
)
returns table (
  id uuid,
  body_snippet text,
  url text,
  channel_id text,
  thread_id text,
  author_person_id text,
  fts_rank bigint,
  vec_rank bigint,
  rrf_score double precision
)
language sql
stable
parallel safe
set search_path = public
as $$
  with fts as (
    select ranked.id, ranked.fts_rank
    from (
      select
        m.id,
        row_number() over (
          order by ts_rank_cd(m.fts, websearch_to_tsquery('english', query_text)) desc, m.ts desc
        ) as fts_rank
      from messages m
      where m.fts @@ websearch_to_tsquery('english', query_text)
    ) ranked
    where ranked.fts_rank <= 50
  ),
  vec as (
    select ranked.id, ranked.vec_rank
    from (
      select
        m.id,
        row_number() over (order by m.embedding <=> query_embedding) as vec_rank
      from messages m
      where m.embedding is not null
    ) ranked
    where ranked.vec_rank <= 50
  ),
  fused as (
    select
      coalesce(fts.id, vec.id) as id,
      fts.fts_rank,
      vec.vec_rank,
      coalesce(1.0 / (60 + fts.fts_rank), 0)
        + coalesce(1.0 / (60 + vec.vec_rank), 0) as rrf_score
    from fts
    full outer join vec on vec.id = fts.id
  )
  select
    m.id,
    left(coalesce(m.body, ''), 280) as body_snippet,
    m.url,
    m.channel_id,
    m.thread_id,
    m.author_person_id,
    fused.fts_rank,
    fused.vec_rank,
    fused.rrf_score
  from fused
  join messages m on m.id = fused.id
  order by fused.rrf_score desc, m.ts desc
  limit 20
$$;
