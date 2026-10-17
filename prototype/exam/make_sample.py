"""Draw the sample English page used by the no-key demo.

The photo is a white sheet on a gray desk, rotated a little, with blue
handwriting and red teacher marks. Run from the repo root:

    python3 prototype/exam/make_sample.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "sample-exam-english.png"
SERIF = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"
ITALIC = "/usr/share/fonts/truetype/noto/NotoSans-Italic.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def main() -> None:
    page = Image.new("RGB", (900, 1280), "white")
    draw = ImageDraw.Draw(page)
    ink = (28, 24, 22)
    blue = (36, 78, 168)
    red = (176, 48, 52)
    draw.rectangle((36, 36, 864, 1244), outline=ink, width=3)
    draw.text((70, 70), "English homework", font=font(SERIF_BOLD, 42), fill=ink)
    draw.text((70, 130), "Name: Pip", font=font(SERIF, 28), fill=ink)

    draw.text((70, 210), "1. Which word means a baby plant?", font=font(SERIF, 32), fill=ink)
    draw.text((110, 270), "A  bloom     B  seedling", font=font(SANS, 28), fill=ink)
    draw.text((110, 320), "C  root      D  fence", font=font(SANS, 28), fill=ink)
    draw.text((620, 200), "seedling", font=font(ITALIC, 36), fill=blue)
    draw.line((780, 250, 820, 290), fill=red, width=6)
    draw.line((780, 290, 840, 230), fill=red, width=6)

    draw.text((70, 430), "2. She ______ a red bag.", font=font(SERIF, 32), fill=ink)
    draw.text((110, 490), "A  have      B  has", font=font(SANS, 28), fill=ink)
    draw.text((188, 412), "has", font=font(ITALIC, 34), fill=blue)
    draw.line((760, 470, 800, 510), fill=red, width=6)
    draw.line((760, 510, 820, 450), fill=red, width=6)

    draw.text((70, 640), "3. The plant needs ______ to", font=font(SERIF, 32), fill=ink)
    draw.text((70, 690), "grow.", font=font(SERIF, 32), fill=(186, 176, 160))
    draw.rectangle((68, 688, 190, 732), outline=(196, 186, 170), width=8)
    draw.text((110, 760), "A", font=font(SANS, 28), fill=(170, 160, 145))
    draw.rectangle((150, 755, 280, 800), fill=(214, 206, 190))
    draw.text((320, 760), "B", font=font(SANS, 28), fill=(170, 160, 145))
    draw.rectangle((360, 755, 490, 800), fill=(206, 198, 182))
    draw.text((110, 820), "C", font=font(SANS, 28), fill=(170, 160, 145))
    draw.rectangle((150, 815, 280, 860), fill=(220, 212, 196))
    draw.text((320, 820), "D", font=font(SANS, 28), fill=(170, 160, 145))
    draw.rectangle((360, 815, 500, 860), fill=(198, 190, 174))
    draw.text((560, 700), "watr", font=font(ITALIC, 40), fill=blue)
    draw.line((760, 760, 830, 840), fill=red, width=6)
    draw.line((830, 760, 760, 840), fill=red, width=6)

    draw.text((70, 980), "Printed in black. Blue is the child's writing.", font=font(SANS, 22), fill=(90, 80, 70))
    draw.text((70, 1020), "Red is the teacher's mark.", font=font(SANS, 22), fill=(90, 80, 70))

    turned = page.rotate(7, expand=True, fillcolor=(110, 103, 95))
    canvas = Image.new("RGB", (turned.width + 90, turned.height + 90), (110, 103, 95))
    canvas.paste(turned, (45, 40))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, format="PNG")
    print(OUT, canvas.size)


if __name__ == "__main__":
    main()
