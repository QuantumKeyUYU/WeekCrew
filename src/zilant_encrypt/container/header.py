"""Container header helpers."""
from __future__ import annotations

import struct
from dataclasses import dataclass

from zilant_encrypt.errors import ContainerFormatError, UnsupportedFeatureError

MAGIC = b"ZILANT01"  # 8 bytes
VERSION = 1
KEY_MODE_PASSWORD_ONLY = 1


@dataclass
class ContainerHeader:
    """Represents a parsed container header."""

    version: int
    key_mode: int
    argon_time_cost: int
    argon_memory_cost: int
    argon_parallelism: int
    salt: bytes
    nonce: bytes
    wrapped_key: bytes


_HEADER_FIXED_STRUCT = struct.Struct("<8sBBIIIHHH")


def build_header(header: ContainerHeader) -> bytes:
    """Serialize a :class:`ContainerHeader` into bytes."""

    if header.version != VERSION:
        raise UnsupportedFeatureError(f"Unsupported version {header.version}")
    if header.key_mode != KEY_MODE_PASSWORD_ONLY:
        raise UnsupportedFeatureError(f"Unsupported key mode {header.key_mode}")

    parts = [
        _HEADER_FIXED_STRUCT.pack(
            MAGIC,
            header.version,
            header.key_mode,
            header.argon_time_cost,
            header.argon_memory_cost,
            header.argon_parallelism,
            len(header.salt),
            len(header.nonce),
            len(header.wrapped_key),
        ),
        header.salt,
        header.nonce,
        header.wrapped_key,
    ]
    body = b"".join(parts)
    return struct.pack("<I", len(body)) + body


def _require_length(buffer: bytes, expected: int, label: str) -> None:
    if len(buffer) < expected:
        raise ContainerFormatError(f"Incomplete {label} section")


def parse_header(blob: bytes) -> ContainerHeader:
    """Parse bytes into :class:`ContainerHeader` and validate fields."""

    if len(blob) < 4:
        raise ContainerFormatError("Missing header length prefix")

    header_len = struct.unpack("<I", blob[:4])[0]
    if len(blob) - 4 < header_len:
        raise ContainerFormatError("Header length exceeds available data")

    header_blob = blob[4 : 4 + header_len]
    _require_length(header_blob, _HEADER_FIXED_STRUCT.size, "header")

    magic, version, key_mode, t_cost, m_cost, parallelism, salt_len, nonce_len, wrapped_len = _HEADER_FIXED_STRUCT.unpack(
        header_blob[: _HEADER_FIXED_STRUCT.size]
    )

    if magic != MAGIC:
        raise ContainerFormatError("Invalid container magic")
    if version != VERSION:
        raise UnsupportedFeatureError(f"Unsupported version {version}")
    if key_mode != KEY_MODE_PASSWORD_ONLY:
        raise UnsupportedFeatureError(f"Unsupported key mode {key_mode}")

    offset = _HEADER_FIXED_STRUCT.size
    _require_length(header_blob[offset:], salt_len, "salt")
    salt = header_blob[offset : offset + salt_len]
    offset += salt_len

    _require_length(header_blob[offset:], nonce_len, "nonce")
    nonce = header_blob[offset : offset + nonce_len]
    offset += nonce_len

    _require_length(header_blob[offset:], wrapped_len, "wrapped key")
    wrapped_key = header_blob[offset : offset + wrapped_len]

    return ContainerHeader(
        version=version,
        key_mode=key_mode,
        argon_time_cost=t_cost,
        argon_memory_cost=m_cost,
        argon_parallelism=parallelism,
        salt=salt,
        nonce=nonce,
        wrapped_key=wrapped_key,
    )
