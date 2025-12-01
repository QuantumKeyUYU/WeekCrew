from pathlib import Path

import pytest

from zilant_encrypt.container.api import encrypt_file


def test_encrypt_respects_overwrite_flag(tmp_path: Path) -> None:
    src = tmp_path / "src.bin"
    dest = tmp_path / "dest.bin"

    src.write_bytes(b"content")
    dest.write_bytes(b"existing")

    with pytest.raises(FileExistsError):
        encrypt_file(src, dest, password="pw", overwrite=False)

    # Should succeed when overwrite is True
    encrypt_file(src, dest, password="pw", overwrite=True)
    assert dest.read_bytes() != b"existing"
