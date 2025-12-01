import os

import pytest

from zilant_encrypt.container.header import (
    KEY_MODE_PASSWORD_ONLY,
    ContainerHeader,
    build_header,
    parse_header,
)
from zilant_encrypt.errors import ContainerFormatError, UnsupportedFeatureError


def test_build_and_parse_header_roundtrip() -> None:
    header = ContainerHeader(
        version=1,
        key_mode=KEY_MODE_PASSWORD_ONLY,
        argon_time_cost=2,
        argon_memory_cost=65536,
        argon_parallelism=2,
        salt=os.urandom(16),
        nonce=os.urandom(12),
        wrapped_key=b"",
    )

    blob = build_header(header)
    parsed = parse_header(blob)

    assert parsed == header


def test_invalid_magic_raises() -> None:
    header = ContainerHeader(
        version=1,
        key_mode=KEY_MODE_PASSWORD_ONLY,
        argon_time_cost=2,
        argon_memory_cost=65536,
        argon_parallelism=2,
        salt=b"1234",
        nonce=b"nonce-nonce",
        wrapped_key=b"",
    )

    blob = build_header(header)
    corrupted = bytearray(blob)
    corrupted[4] = 0x00

    with pytest.raises(ContainerFormatError):
        parse_header(bytes(corrupted))


def test_unsupported_version() -> None:
    header_blob = bytearray(build_header(
        ContainerHeader(
            version=1,
            key_mode=KEY_MODE_PASSWORD_ONLY,
            argon_time_cost=2,
            argon_memory_cost=65536,
            argon_parallelism=2,
            salt=b"abcd",
            nonce=b"123456789012",
            wrapped_key=b"",
        )
    ))

    # overwrite version byte (first after magic)
    header_blob[4 + 8] = 0x05
    with pytest.raises(UnsupportedFeatureError):
        parse_header(bytes(header_blob))
