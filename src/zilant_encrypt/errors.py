"""Custom exceptions for zilant_encrypt."""


class InvalidPassword(Exception):
    """Raised when decryption fails due to wrong password or tampering."""


class ContainerFormatError(Exception):
    """Raised when a container header is malformed or incomplete."""


class UnsupportedFeatureError(Exception):
    """Raised when a container requires features unsupported by this build."""
