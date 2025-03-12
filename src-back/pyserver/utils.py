from pydantic import BaseModel
from typing import Optional


class AtlasData(BaseModel):
    root: str
    id_database: str


class Coordinates(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    filepath: str
    pos: Optional[Coordinates]
    cdt: str
    mdt: str
    col: str
