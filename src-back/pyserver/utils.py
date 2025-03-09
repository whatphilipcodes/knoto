from pydantic import BaseModel
from datetime import datetime


class AtlasData(BaseModel):
    root: str
    id_database: str


class Coordinates(BaseModel):
    x: float
    y: float


class Node(BaseModel):
    filepath: str
    coordinates: Coordinates
    created: datetime
