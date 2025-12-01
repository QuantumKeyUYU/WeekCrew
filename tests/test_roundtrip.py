import os
from pathlib import Path

from zilant_encrypt.container.api import decrypt_file, encrypt_file


def test_encrypt_decrypt_roundtrip(tmp_path: Path) -> None:
    plaintext_path = tmp_path / "data.bin"
    encrypted_path = tmp_path / "data.bin.zilant"
    decrypted_path = tmp_path / "data.dec"

    data = os.urandom(1024)
    plaintext_path.write_bytes(data)

    encrypt_file(plaintext_path, encrypted_path, password="secret")
    decrypt_file(encrypted_path, decrypted_path, password="secret")

    assert decrypted_path.read_bytes() == data
