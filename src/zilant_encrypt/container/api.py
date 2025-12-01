"""High-level encryption API."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from argon2.low_level import Type, hash_secret_raw
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from zilant_encrypt.container.header import (
    KEY_MODE_PASSWORD_ONLY,
    ContainerHeader,
    build_header,
    parse_header,
)
from zilant_encrypt.errors import ContainerFormatError, InvalidPassword

ARGON_TIME_COST = 2
ARGON_MEMORY_COST = 65536  # KiB
ARGON_PARALLELISM = 2
SALT_SIZE = 16
NONCE_SIZE = 12
KEY_SIZE = 32


@dataclass
class EncryptionResult:
    header: ContainerHeader
    ciphertext_size: int


def _derive_key(password: str, salt: bytes, t_cost: int, m_cost: int, parallelism: int) -> bytes:
    if not password:
        raise ValueError("Password must not be empty")

    return hash_secret_raw(
        secret=password.encode("utf-8"),
        salt=salt,
        time_cost=t_cost,
        memory_cost=m_cost,
        parallelism=parallelism,
        hash_len=KEY_SIZE,
        type=Type.ID,
    )


def _read_file(path: Path) -> bytes:
    with path.open("rb") as fh:
        return fh.read()


def _write_file(path: Path, data: bytes, overwrite: bool) -> None:
    if path.exists() and not overwrite:
        raise FileExistsError(f"Output file {path} already exists")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as fh:
        fh.write(data)


def encrypt_file(input_path: os.PathLike[str] | str, output_path: os.PathLike[str] | str, *, password: str, overwrite: bool = False) -> EncryptionResult:
    """Encrypt a file using a password-only mode."""

    input_file = Path(input_path)
    output_file = Path(output_path)
    if not input_file.exists():
        raise FileNotFoundError(input_file)

    plaintext = _read_file(input_file)

    salt = os.urandom(SALT_SIZE)
    nonce = os.urandom(NONCE_SIZE)
    key = _derive_key(password, salt, ARGON_TIME_COST, ARGON_MEMORY_COST, ARGON_PARALLELISM)

    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)

    header = ContainerHeader(
        version=1,
        key_mode=KEY_MODE_PASSWORD_ONLY,
        argon_time_cost=ARGON_TIME_COST,
        argon_memory_cost=ARGON_MEMORY_COST,
        argon_parallelism=ARGON_PARALLELISM,
        salt=salt,
        nonce=nonce,
        wrapped_key=b"",
    )

    container = build_header(header) + ciphertext
    _write_file(output_file, container, overwrite)

    return EncryptionResult(header=header, ciphertext_size=len(ciphertext))


def decrypt_file(input_path: os.PathLike[str] | str, output_path: os.PathLike[str] | str, *, password: str, overwrite: bool = False) -> None:
    """Decrypt a container using password-only mode."""

    input_file = Path(input_path)
    output_file = Path(output_path)
    if not input_file.exists():
        raise FileNotFoundError(input_file)

    data = _read_file(input_file)

    header_len = int.from_bytes(data[:4], "little")
    header = parse_header(data)
    header_end = 4 + header_len
    ciphertext = data[header_end:]
    if not ciphertext:
        raise ContainerFormatError("Container missing ciphertext")

    key = _derive_key(password, header.salt, header.argon_time_cost, header.argon_memory_cost, header.argon_parallelism)

    aesgcm = AESGCM(key)
    try:
        plaintext = aesgcm.decrypt(header.nonce, ciphertext, None)
    except InvalidTag as exc:  # wrong password or tampering
        raise InvalidPassword("Failed to decrypt with provided password") from exc

    _write_file(output_file, plaintext, overwrite)
