from pydantic import BaseModel
from typing import Optional


class AtlasData(BaseModel):
    root: str
    subdir_nodes: str
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


class UpdateNodeRequest(BaseModel):
    current: NodeData
    updated: NodeData
