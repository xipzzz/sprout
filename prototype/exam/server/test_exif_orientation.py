"""Camera EXIF orientation is applied before deskew and OCR.

fixtures/02-rotated-exif6-worksheet1.jpg holds the pixels of 01-local-worksheet1.jpg
turned a quarter left, tagged with EXIF orientation 6, as a phone held sideways saves it.
"""

import io
import shutil
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

from deskew import UPRIGHT_STEPS, exif_orientation, prepare_page, upright
from extract import _tesseract_text

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
UPRIGHT_PAGE = FIXTURES / "01-local-worksheet1.jpg"
ROTATED_PAGE = FIXTURES / "02-rotated-exif6-worksheet1.jpg"


def marker() -> Image.Image:
    """A 3 by 2 image with one red pixel in the top left corner."""
    image = Image.new("RGB", (3, 2), "white")
    image.putpixel((0, 0), (255, 0, 0))
    return image


def tagged(image: Image.Image, orientation: int) -> Image.Image:
    buffer = io.BytesIO()
    exif = Image.Exif()
    exif[0x0112] = orientation
    image.save(buffer, format="PNG", exif=exif)
    return Image.open(io.BytesIO(buffer.getvalue()))


# What a camera stores for each orientation, given the upright marker.
STORED = {
    1: lambda im: im,
    2: lambda im: im.transpose(Image.Transpose.FLIP_LEFT_RIGHT),
    3: lambda im: im.transpose(Image.Transpose.ROTATE_180),
    4: lambda im: im.transpose(Image.Transpose.FLIP_TOP_BOTTOM),
    5: lambda im: im.transpose(Image.Transpose.TRANSPOSE),
    6: lambda im: im.transpose(Image.Transpose.ROTATE_90),
    7: lambda im: im.transpose(Image.Transpose.TRANSVERSE),
    8: lambda im: im.transpose(Image.Transpose.ROTATE_270),
}


class OrientationTableTests(unittest.TestCase):
    def test_every_orientation_comes_back_upright(self):
        self.assertEqual(set(UPRIGHT_STEPS), set(STORED))
        for orientation, store in STORED.items():
            fixed = upright(tagged(store(marker()), orientation))
            self.assertEqual(fixed.size, (3, 2), orientation)
            self.assertEqual(fixed.getpixel((0, 0)), (255, 0, 0), orientation)

    def test_missing_or_odd_tag_means_no_turn(self):
        self.assertEqual(exif_orientation(marker()), 1)
        self.assertEqual(exif_orientation(tagged(marker(), 42)), 1)


class RotatedFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rotated = prepare_page(ROTATED_PAGE.read_bytes())
        cls.straight = prepare_page(UPRIGHT_PAGE.read_bytes())

    def test_fixture_is_stored_sideways(self):
        with Image.open(ROTATED_PAGE) as stored:
            self.assertEqual(exif_orientation(stored), 6)
            self.assertGreater(stored.width, stored.height)

    def test_page_is_turned_before_deskew(self):
        self.assertEqual(self.rotated["deskew"]["exif_orientation"], 6)
        clean = self.rotated["clean_rgb"]
        self.assertGreater(clean.shape[0], clean.shape[1])
        self.assertEqual(clean.shape, self.straight["clean_rgb"].shape)
        a = clean.astype(np.float32).mean(axis=2)
        b = self.straight["clean_rgb"].astype(np.float32).mean(axis=2)
        self.assertGreater(np.corrcoef(a.ravel(), b.ravel())[0, 1], 0.9)

    @unittest.skipUnless(shutil.which("tesseract"), "Tesseract binary not installed")
    def test_ocr_reads_the_turned_page(self):
        text = _tesseract_text(self.rotated["clean_rgb"])
        self.assertIn("Worksheet", text)
        self.assertIn("correct answer", text)


if __name__ == "__main__":
    unittest.main()
