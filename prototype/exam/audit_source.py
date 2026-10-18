"""Print shared source lines for a human license review. Never writes either tree.

Usage: python prototype/exam/audit_source.py /path/to/Goppai-exam
This is a comparison aid, not a legal or originality test.
"""

import argparse
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEXT = {'.py', '.ts', '.tsx', '.css', '.txt', '.json', '.md', '.mjs'}


def source_files(root):
    for path in root.rglob('*'):
        if path.is_file() and not any(part.startswith('.') or part in {'node_modules', '__pycache__', 'dist'} for part in path.relative_to(root).parts):
            yield path


def compare(upstream):
    upstream_lines = {}
    upstream_hashes = {}
    for path in source_files(upstream):
        upstream_hashes.setdefault(hashlib.sha256(path.read_bytes()).hexdigest(), path)
        if path.suffix in TEXT:
            for number, line in enumerate(path.read_text(errors='replace').splitlines(), 1):
                line = line.strip()
                if len(line) >= 40:
                    upstream_lines.setdefault(line, (path, number))
    local = list(source_files(ROOT / 'prototype' / 'exam')) + list(source_files(ROOT / 'src' / 'exam'))
    local += list((ROOT / 'src' / 'screens').glob('Exam*'))
    local += [ROOT / 'src' / 'styles' / 'app.css', ROOT / 'public' / 'sample-exam-english.png']
    for path in local:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in upstream_hashes:
            print(f'IDENTICAL FILE: {path.relative_to(ROOT)} == {upstream_hashes[digest].relative_to(upstream)}')
        if path.suffix not in TEXT:
            continue
        for number, line in enumerate(path.read_text(errors='replace').splitlines(), 1):
            if line.strip() in upstream_lines:
                other, other_number = upstream_lines[line.strip()]
                print(f'{path.relative_to(ROOT)}:{number} == {other.relative_to(upstream)}:{other_number}: {line.strip()}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('upstream', type=Path)
    compare(parser.parse_args().upstream.resolve())
