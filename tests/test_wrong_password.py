import os
from pathlib import Path

import pytest

from zilant_encrypt.container.api import decrypt_file, encrypt_file
from zilant_encrypt.errors import InvalidPassword


def test_wrong_password_raises_invalid_password(tmp_path: Path) -> None:
    plaintext_path = tmp_path / "data.bin"
    encrypted_path = tmp_path / "data.bin.zilant"
    decrypted_path = tmp_path / "data.dec"

    data = os.urandom(128)
    plaintext_path.write_bytes(data)

    encrypt_file(plaintext_path, encrypted_path, password="correct-horse")

    with pytest.raises(InvalidPassword):
        decrypt_file(encrypted_path, decrypted_path, password="wrong")
