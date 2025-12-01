"""Command line interface for zilant_encrypt."""
from __future__ import annotations

import sys
from pathlib import Path

import click

from zilant_encrypt import decrypt_file, encrypt_file
from zilant_encrypt.errors import ContainerFormatError, InvalidPassword, UnsupportedFeatureError


@click.group()
def cli() -> None:
    """Zilant Encrypt utility."""


@cli.command()
@click.argument("input", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--out", "output", required=True, type=click.Path(dir_okay=False, path_type=Path))
@click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True)
@click.option("--overwrite", is_flag=True, help="Overwrite output file if it exists")
def encrypt(input: Path, output: Path, password: str, overwrite: bool) -> None:  # noqa: A002
    """Encrypt INPUT file into container."""

    try:
        encrypt_file(input, output, password=password, overwrite=overwrite)
    except FileExistsError as exc:
        click.echo(str(exc), err=True)
        sys.exit(2)
    except Exception as exc:  # pragma: no cover - safety net
        click.echo(f"Encryption failed: {exc}", err=True)
        sys.exit(1)


@cli.command()
@click.argument("input", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--out", "output", required=True, type=click.Path(dir_okay=False, path_type=Path))
@click.option("--password", prompt=True, hide_input=True)
@click.option("--overwrite", is_flag=True, help="Overwrite output file if it exists")
def decrypt(input: Path, output: Path, password: str, overwrite: bool) -> None:  # noqa: A002
    """Decrypt INPUT container into plaintext file."""

    try:
        decrypt_file(input, output, password=password, overwrite=overwrite)
    except InvalidPassword:
        click.echo("Invalid password or corrupted container", err=True)
        sys.exit(3)
    except (ContainerFormatError, UnsupportedFeatureError, FileExistsError) as exc:
        click.echo(str(exc), err=True)
        sys.exit(2)
    except Exception as exc:  # pragma: no cover - safety net
        click.echo(f"Decryption failed: {exc}", err=True)
        sys.exit(1)


def main() -> None:  # pragma: no cover - CLI entrypoint
    cli()


if __name__ == "__main__":  # pragma: no cover
    main()
