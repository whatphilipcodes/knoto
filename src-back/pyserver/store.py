from typing import ClassVar, Optional
from utils import NodeData
from db import AtlasDB
from model import Model
import os


class Store:
    atlas_root: ClassVar[Optional[str]] = None
    db_path: ClassVar[Optional[str]] = None
    model: ClassVar[Optional[Model]] = None
    db: ClassVar[Optional[AtlasDB]] = None

    def __new__(cls):
        raise TypeError("Store cannot be instantiated")

    @classmethod
    def init(cls) -> None:
        cls.model = Model()

    @classmethod
    def set_atlas(cls, root: str, id_database: str) -> None:
        cls.atlas_root = root
        cls.db_path = os.path.join(root, id_database)
        if not cls.db:
            cls.db = AtlasDB(cls.db_path)
        else:
            cls.db.change_db(cls.db_path)

    @classmethod
    def insert_nodes(cls, nodes: NodeData | list[NodeData]) -> list[NodeData]:
        if not isinstance(nodes, list):
            nodes = [nodes]
        results = list(map(cls.model.infer, nodes))
        for result in results:
            cls.db.insert_node(result)
        return results

    @classmethod
    def update_node(cls, node: NodeData) -> NodeData:
        # result = cls.model.infer(node)
        cls.db.update_node(node)
        return node

    @classmethod
    def delete_node(cls, filepath: str) -> None:
        cls.db.delete_node(filepath)

    @classmethod
    def get_all_nodes(cls) -> list[NodeData]:
        if not cls.db:
            return []
        return cls.db.get_all_nodes()
