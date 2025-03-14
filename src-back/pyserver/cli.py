import argparse
from dataclasses import dataclass
from typing import Optional


@dataclass
class CommandLineArgs:
    dev: Optional[bool]
    port: Optional[int]
    devurl: Optional[str]


def parse_arguments() -> CommandLineArgs:
    parser = argparse.ArgumentParser(description="pyserver backend API")
    parser.add_argument(
        "--dev",
        "-d",
        action="store_true",
        default=False,
        help="enable development mode",
        required=False,
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="port number at which the uvicorn server is initialized at (default: 8000)",
        required=False,
    )
    parser.add_argument(
        "--devurl",
        type=str,
        default="http://localhost:1420",
        help="vite dev server url; must include a port number (default: http://localhost:1420)",
        required=False,
    )
    args = parser.parse_args()

    if args.port < 1024 or args.port > 65535:
        raise ValueError("Port must be between 1024 and 65535")

    return args
