from pydantic import BaseModel


class AtlasData(BaseModel):
    root: str
    id_database: str


class Coordinates(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    filepath: str
    pos: Coordinates
    cdt: str
    mdt: str
    col: str
