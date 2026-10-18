"""Synthetic worksheet photos for tests and demos.

Real P1-P4 pages stay private, so these reproduce the patterns seen on them:
blue answers written into blanks, red marks, blue ink crossing black print,
blue printed URLs, fill-in passages, Chinese pages and pencil. Each page keeps
its layers, so tests can check exactly which pixels were print and which were ink.

Run `python synthetic_pages.py OUT_DIR` to write the JPEGs.
"""

from __future__ import annotations

import io
import math
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

WIDTH, HEIGHT = 1240, 1754
PAPER = (247, 243, 232)
BLACK = (22, 22, 24)
BLUE_PRINT = (18, 70, 205)
BLUE_PEN = (32, 58, 168)
RED_PEN = (205, 32, 42)
PENCIL = (112, 112, 116)

_SANS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
_HAND = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
    "/usr/share/fonts/truetype/croscore/Arimo-Italic.ttf",
    "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
    "/System/Library/Fonts/Supplemental/Chalkboard.ttc",
]
_HAN = [
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
]


def _font(paths: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)


def han_font_available() -> bool:
    return any(Path(path).exists() for path in _HAN)


@dataclass
class Page:
    name: str
    photo: np.ndarray
    jpeg: bytes
    print_mask: np.ndarray
    blue_print_mask: np.ndarray
    hand_mask: np.ndarray
    pencil_mask: np.ndarray
    hand_words: list[str] = field(default_factory=list)


class _Canvas:
    def __init__(self, seed: int):
        self.rng = random.Random(seed)
        self.layers = {key: Image.new("L", (WIDTH, HEIGHT), 0) for key in ("print", "blue_print", "pen", "red", "pencil")}
        self.draw = {key: ImageDraw.Draw(layer) for key, layer in self.layers.items()}
        self.hand_words: list[str] = []

    def text(self, xy, value, size=30, layer="print", font=None):
        self.draw[layer].text(xy, value, fill=255, font=font or _font(_SANS, size))

    def blank(self, x, y, width, layer="print"):
        self.draw[layer].line((x, y, x + width, y), fill=255, width=2)

    def box(self, rect):
        self.draw["print"].rectangle(rect, outline=255, width=2)

    def hand(self, xy, word, size=34, layer="pen", tilt=None, fonts=None):
        """One handwritten word: italic letters with per-letter jitter and a tilted baseline."""
        self.hand_words.append(word)
        tilt = self.rng.uniform(-7, 7) if tilt is None else tilt
        pad = size
        patch = Image.new("L", (int(size * 0.75 * len(word)) + pad * 2, size * 3), 0)
        draw = ImageDraw.Draw(patch)
        x = pad
        for char in word:
            letter_size = int(size * self.rng.uniform(0.85, 1.15))
            font = _font(fonts or _HAND, letter_size)
            draw.text((x, size + self.rng.randint(-4, 4)), char, fill=255, font=font)
            x += int(draw.textlength(char, font=font) * self.rng.uniform(0.95, 1.2))
        patch = patch.rotate(tilt, resample=Image.Resampling.BICUBIC, expand=True)
        patch = patch.point(lambda value: 255 if value > 90 else int(value * 2.2))
        target = self.layers[layer]
        target.paste(Image.new("L", patch.size, 255), (int(xy[0] - pad), int(xy[1] - size)), patch)

    def stroke(self, points, layer="pen", width=4):
        self.draw[layer].line(points, fill=255, width=width, joint="curve")

    def circle(self, center, rx, ry, layer="pen"):
        cx, cy = center
        points = []
        for step in range(0, 380, 12):
            angle = math.radians(step)
            wobble = 1 + self.rng.uniform(-0.05, 0.05)
            points.append((cx + rx * wobble * math.cos(angle), cy + ry * wobble * math.sin(angle)))
        self.stroke(points, layer=layer, width=4)

    def tick(self, x, y, size=46):
        self.stroke([(x, y), (x + size * 0.35, y + size * 0.45), (x + size, y - size * 0.5)], layer="red", width=6)

    def cross(self, x, y, size=40):
        self.stroke([(x, y), (x + size, y + size)], layer="red", width=6)
        self.stroke([(x + size, y), (x, y + size)], layer="red", width=6)

    def pencil_scribble(self, points, width=3):
        self.stroke(points, layer="pencil", width=width)

    def render(self, name: str, seed: int) -> Page:
        rng = np.random.default_rng(seed)
        ys, xs = np.mgrid[0:HEIGHT, 0:WIDTH]
        light = 1 - 0.05 * (xs / WIDTH) - 0.03 * (ys / HEIGHT)
        image = np.ones((HEIGHT, WIDTH, 3), np.float32) * np.array(PAPER, np.float32) * light[..., None]
        alphas = {key: np.asarray(layer, np.float32) / 255.0 for key, layer in self.layers.items()}
        grain = rng.uniform(0.55, 1.0, size=(HEIGHT, WIDTH)).astype(np.float32)
        alphas["pencil"] = alphas["pencil"] * grain
        for key, colour in (("print", BLACK), ("blue_print", BLUE_PRINT), ("pencil", PENCIL), ("pen", BLUE_PEN), ("red", RED_PEN)):
            factor = 1 - alphas[key][..., None] * (1 - np.array(colour, np.float32) / 255.0)
            image *= factor
        photo = Image.fromarray(np.clip(image, 0, 255).astype(np.uint8), "RGB").filter(ImageFilter.GaussianBlur(0.7))
        noisy = np.asarray(photo, np.float32) + rng.normal(0, 2.5, size=(HEIGHT, WIDTH, 3))
        photo = Image.fromarray(np.clip(noisy, 0, 255).astype(np.uint8), "RGB")
        buffer = io.BytesIO()
        photo.save(buffer, format="JPEG", quality=82, subsampling=2)
        jpeg = buffer.getvalue()
        decoded = np.asarray(Image.open(io.BytesIO(jpeg)).convert("RGB"))
        return Page(
            name=name,
            photo=decoded,
            jpeg=jpeg,
            print_mask=alphas["print"] > 0.6,
            blue_print_mask=alphas["blue_print"] > 0.6,
            hand_mask=(alphas["pen"] > 0.4) | (alphas["red"] > 0.4),
            pencil_mask=alphas["pencil"] > 0.3,
            hand_words=self.hand_words,
        )


_MCQ = [
    ("Ali is playing with his new toy.", "is having fun.", ["It", "He", "She"], "He"),
    ("Samad and Ali", "cleaning the whiteboard.", ["is", "are", "was"], "are"),
    ("The horse jumped", "the fence.", ["in", "on", "over"], "over"),
    ("Please pour the sugar", "the jar.", ["in", "into", "through"], "into"),
    ("Fiona fell down", "hurt her knee.", ["or", "so", "and"], "and"),
]


def _mcq_page(seed: int, name: str, handwriting: bool, pencil: bool = False) -> Page:
    canvas = _Canvas(seed)
    canvas.text((90, 70), "Worksheet 3", size=40)
    canvas.text((90, 135), "Choose the correct answer. Write its number in the brackets.", size=26)
    y = 210
    for number, (before, after, choices, answer) in enumerate(_MCQ, start=1):
        canvas.text((90, y), f"{number}.", size=30)
        canvas.text((150, y), before, size=30)
        width = int(canvas.draw["print"].textlength(before, font=_font(_SANS, 30)))
        blank_x = 150 + width + 14
        canvas.blank(blank_x, y + 34, 150)
        canvas.text((blank_x + 165, y), after, size=30)
        canvas.text((1050, y + 150), "(        )", size=30)
        for index, choice in enumerate(choices, start=1):
            canvas.text((150, y + 50 * index), f"({index})  {choice}", size=30)
        if handwriting:
            canvas.hand((blank_x + 20, y + 4), answer)
            canvas.hand((1092, y + 150), str(choices.index(answer) + 1), size=36, tilt=0)
            chosen = choices.index(answer) + 1
            canvas.circle((195, y + 50 * chosen + 17), 70, 26)
            if number % 2:
                canvas.tick(1150, y + 40)
            else:
                canvas.cross(1150, y + 20)
        if pencil:
            canvas.hand((blank_x + 20, y + 4), answer, layer="pencil")
            canvas.pencil_scribble([(1080, y + 160), (1100, y + 190), (1125, y + 150)])
        y += 280
    canvas.text((90, y + 10), "Not suitable for children under three.", size=30)
    if handwriting:
        canvas.hand((150, y + 6), "because", size=40, tilt=-4)
        canvas.stroke([(80, y + 30), (640, y + 22)], width=4)
    canvas.text((420, HEIGHT - 90), "www.sgexam.com", size=28, layer="blue_print")
    canvas.text((600, HEIGHT - 50), "3", size=24)
    return canvas.render(name, seed)


def blue_ink_mcq(seed: int = 7) -> Page:
    return _mcq_page(seed, "blue-ink-mcq", handwriting=True)


def clean_blue_url(seed: int = 8) -> Page:
    return _mcq_page(seed, "clean-blue-url", handwriting=False)


def pencil_mcq(seed: int = 9) -> Page:
    return _mcq_page(seed, "pencil-mcq", handwriting=False, pencil=True)


_CLOZE = [
    "Last Sunday, Ben and his family went",
    "(1) ________ the zoo. They saw a big elephant (2) ________ was",
    "eating bananas. Ben's sister was scared (3) ________ the tiger",
    "roared loudly. After lunch, they (4) ________ the monkeys swing",
    "from tree to tree. Ben (5) ________ a photo of a baby monkey.",
    "It was (6) ________ best day of the holidays.",
]


def cloze_passage(seed: int = 11) -> Page:
    canvas = _Canvas(seed)
    canvas.text((90, 70), "Section B: Grammar Cloze", size=36)
    canvas.text((90, 130), "Fill in each blank with a suitable word. (6 marks)", size=26)
    for index, line in enumerate(_CLOZE):
        canvas.text((90, 220 + index * 62), line, size=30)
    canvas.hand((210, 282 - 4), "to")
    canvas.hand((960, 282 - 4), "that")
    canvas.text((420, HEIGHT - 90), "www.sgexam.com", size=28, layer="blue_print")
    return canvas.render("cloze-passage", seed)


_CHINESE = [
    ("1. 小明每天早上七点钟去学校。", ["A. 上课", "B. 学校", "C. 公园", "D. 商店"]),
    ("2. 妈妈在厨房里做饭。", ["A. 厨房", "B. 花园", "C. 学校", "D. 医院"]),
    ("3. 我们要爱护公园里的花草。", ["A. 爱护", "B. 爱心", "C. 保护", "D. 喜爱"]),
]


def chinese_mcq(seed: int = 13) -> Page:
    canvas = _Canvas(seed)
    font = _font(_HAN, 34)
    canvas.text((90, 70), "华文 练习 二", font=_font(_HAN, 40))
    canvas.text((90, 140), "选出正确的答案。", font=font)
    y = 230
    for stem, choices in _CHINESE:
        canvas.text((90, y), stem, font=font)
        for index, choice in enumerate(choices):
            canvas.text((150 + index * 240, y + 60), choice, font=font)
        y += 170
    return canvas.render("chinese-mcq", seed)


_CHINESE_INK = [
    ("小华", "和妈妈去公园玩。", ["昨天", "明天", "每天", "今天"], "昨天"),
    ("弟弟", "地吃着苹果。", ["开心", "白云", "红色", "大声"], "开心"),
    ("天", "了，我们回家吧。", ["黑", "白", "红", "绿"], "黑"),
    ("这本书", "好看。", ["很", "太", "都", "也"], "很"),
]


def chinese_ink_mcq(seed: int = 17) -> Page:
    """A Chinese fill-in page with blue answers in the blanks and brackets, and red marks."""
    canvas = _Canvas(seed)
    font = _font(_HAN, 34)
    canvas.text((90, 70), "华文 练习 三", font=_font(_HAN, 40))
    canvas.text((90, 140), "选出正确的答案，把号码写在括号里。", font=font)
    y = 240
    for number, (before, after, choices, answer) in enumerate(_CHINESE_INK, start=1):
        canvas.text((90, y), f"{number}.", font=font)
        canvas.text((140, y), before, font=font)
        width = int(canvas.draw["print"].textlength(before, font=font))
        blank_x = 140 + width + 12
        canvas.blank(blank_x, y + 40, 140)
        canvas.text((blank_x + 152, y), after, font=font)
        canvas.text((1010, y), "（     ）", font=font)
        for index, choice in enumerate(choices, start=1):
            canvas.text((150 + (index - 1) * 230, y + 70), f"({index}) {choice}", font=font)
        canvas.hand((blank_x + 20, y + 4), answer, size=34, fonts=_HAN)
        canvas.hand((1068, y + 4), str(choices.index(answer) + 1), size=36, tilt=0)
        if number % 2:
            canvas.tick(1150, y + 40)
        else:
            canvas.cross(1150, y + 10)
        y += 190
    return canvas.render("chinese-ink-mcq", seed)


ALL = [blue_ink_mcq, clean_blue_url, pencil_mcq, cloze_passage, chinese_mcq, chinese_ink_mcq]


def main(out_dir: str) -> None:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for build in ALL:
        page = build()
        (out / f"{page.name}.jpg").write_bytes(page.jpeg)
        print(out / f"{page.name}.jpg")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(Path(__file__).resolve().parents[1] / "fixtures" / "synthetic"))
