"""Rasteriza el logo vectorial de círculos y genera los iconos de instalación."""
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
svg = ET.parse(root / 'logo.svg').getroot()
scale = 4
canvas = Image.new('RGB', (512 * scale, 512 * scale), svg[0].attrib['fill'])
draw = ImageDraw.Draw(canvas)
for circle in list(svg)[1:]:
    cx, cy, radius, stroke = [float(circle.attrib[k]) for k in ('cx', 'cy', 'r', 'stroke-width')]
    outer, inner = radius + stroke / 2, radius - stroke / 2
    draw.ellipse(tuple(v * scale for v in (cx-outer, cy-outer, cx+outer, cy+outer)), fill=circle.attrib['stroke'])
    draw.ellipse(tuple(v * scale for v in (cx-inner, cy-inner, cx+inner, cy+inner)), fill=svg[0].attrib['fill'])
for size in (180, 192, 256, 512):
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon-{size}.png')
icon = canvas.resize((256, 256), Image.Resampling.LANCZOS)
icon.save(root / 'favicon.ico', sizes=[(n, n) for n in (16, 24, 32, 48, 64, 128, 256)])
