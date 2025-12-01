from pathlib import Path

import pytest

from zilant_encrypt.container.api import decrypt_file, encrypt_file
from zilant_encrypt.errors import ContainerFormatError


def test_corrupted_header_raises_format_error(tmp_path: Path) -> None:
    plaintext = tmp_path / "plain.bin"
    container = tmp_path / "container.bin"
    output = tmp_path / "out.bin"

    plaintext.write_bytes(b"hello")
    encrypt_file(plaintext, container, password="pw")

    data = bytearray(container.read_bytes())
    data[2] ^= 0xFF
    container.write_bytes(data)

    with pytest.raises(ContainerFormatError):
        decrypt_file(container, output, password="pw")
