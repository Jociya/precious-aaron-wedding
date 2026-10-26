"""Create web-sized wedding photos and refresh the static photo manifest."""

from __future__ import annotations

import json
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ModuleNotFoundError as error:
    if error.name != "PIL":
        raise
    raise SystemExit(
        "Pillow is missing from this Python environment. From the website folder, "
        "run: python -m pip install -r requirements.txt"
    ) from error


ROOT = Path(__file__).resolve().parent
PHOTO_MARKER_START = "// GENERATED PHOTO MANIFEST START"
PHOTO_MARKER_END = "// GENERATED PHOTO MANIFEST END"


def find_source(primary: str, legacy: str) -> Path:
    """Prefer the ignored originals folder, then use the existing photo folders."""
    candidates = (ROOT / "originals" / primary, ROOT / legacy)
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    expected = ", ".join(str(candidate) for candidate in candidates)
    raise FileNotFoundError(f"No source photo folder found. Checked: {expected}")


def process(src_dir: Path, out_dir: Path, prefix: str) -> list[dict[str, int | str]]:
    if not src_dir.is_dir():
        raise FileNotFoundError(f"Source photo folder does not exist: {src_dir}")

    files = sorted(
        (
            path
            for path in src_dir.iterdir()
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}
        ),
        key=lambda path: path.name.casefold(),
    )
    if not files:
        raise FileNotFoundError(f"No JPG or PNG photos found in {src_dir}")

    full_dir, thumb_dir = out_dir / "full", out_dir / "thumb"
    full_dir.mkdir(parents=True, exist_ok=True)
    thumb_dir.mkdir(parents=True, exist_ok=True)
    expected_names = {f"{prefix}-{index:02d}.jpg" for index in range(1, len(files) + 1)}
    for destination_dir in (full_dir, thumb_dir):
        for stale_file in destination_dir.glob(f"{prefix}-*.jpg"):
            if stale_file.name not in expected_names:
                stale_file.unlink()

    manifest: list[dict[str, int | str]] = []
    for index, source in enumerate(files, 1):
        name = f"{prefix}-{index:02d}.jpg"
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")

        width, height = image.size
        for destination, max_size, quality in (
            (full_dir / name, 1800, 82),
            (thumb_dir / name, 700, 78),
        ):
            resized = image.copy()
            resized.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            resized.save(
                destination,
                "JPEG",
                quality=quality,
                optimize=True,
                progressive=True,
            )

        manifest.append(
            {
                "full": f"{out_dir.relative_to(ROOT).as_posix()}/full/{name}",
                "thumb": f"{out_dir.relative_to(ROOT).as_posix()}/thumb/{name}",
                "width": width,
                "height": height,
            }
        )
    print(f"{prefix}: {len(manifest)} photos optimized from {src_dir.name}")
    return manifest


def write_manifest(pre_wedding: list[dict[str, int | str]], traditional: list[dict[str, int | str]]) -> None:
    data_file = ROOT / "data.js"
    content = data_file.read_text(encoding="utf-8")
    start = content.find(PHOTO_MARKER_START)
    end = content.find(PHOTO_MARKER_END)
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"Photo manifest markers are missing or out of order in {data_file}")

    generated = (
        f"{PHOTO_MARKER_START}\n"
        "const photoManifest = {\n"
        f"  preWedding: {json.dumps(pre_wedding, indent=2)},\n"
        f"  traditional: {json.dumps(traditional, indent=2)}\n"
        "};\n"
    )
    updated = content[:start] + generated + content[end:]
    data_file.write_text(updated, encoding="utf-8")
    print(f"Updated photo lists in {data_file.name}")


def main() -> None:
    pre_wedding_source = find_source("pre-wedding", "Pre_Wedding_Shoot")
    traditional_source = find_source("traditional", "Traditional_Marriage")
    pre_wedding = process(
        pre_wedding_source,
        ROOT / "images" / "pre-wedding",
        "pre",
    )
    traditional = process(
        traditional_source,
        ROOT / "images" / "traditional",
        "trad",
    )
    write_manifest(pre_wedding, traditional)


if __name__ == "__main__":
    main()
