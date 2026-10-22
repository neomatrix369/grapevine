# Builds contact-sheet.png from screens/*-1280.png (python3 + Pillow). Run after render.mjs.
from PIL import Image, ImageDraw, ImageFont
import glob, os
order = ['ask','ask-loading','ask-not-enough-coverage','ask-results','ask-results-dark','announce','library','experts','experts-graph','my-posts','growth','growth-after-read','end-card']
files = [f'screens/{n}-1280.png' for n in order if os.path.exists(f'screens/{n}-1280.png')]
W, H, cols, pad, lab = 640, 500, 3, 24, 28
rows = -(-len(files) // cols)
sheet = Image.new('RGB', (cols * (W + pad) + pad, rows * (H + lab + pad) + pad), (239, 235, 227))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('DejaVuSansMono.ttf', 16)
except OSError: font = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB'); im = im.crop((0, 0, 1280, min(im.height, 1000))); im.thumbnail((W, H))
    x = pad + (i % cols) * (W + pad); y = pad + (i // cols) * (H + lab + pad)
    d.text((x, y), os.path.basename(f).replace('-1280.png', ''), fill=(17, 17, 16), font=font)
    sheet.paste(im, (x, y + lab)); d.rectangle([x - 1, y + lab - 1, x + im.width, y + lab + im.height], outline=(217, 211, 199))
sheet.save('contact-sheet.png'); print(len(files), sheet.size)
