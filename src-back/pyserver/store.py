from typing import ClassVar, Optional
from utils import Node
from db import AtlasDB
import os


class Store:
    atlas_root: ClassVar[Optional[str]] = None
    db_path: ClassVar[Optional[str]] = None
    db: ClassVar[Optional[AtlasDB]] = None

    def __new__(cls):
        raise TypeError("Store cannot be instantiated")

    @classmethod
    def set_atlas(cls, root: str, id_database: str) -> None:
        cls.atlas_root = root
        cls.db_path = os.path.join(root, id_database)
        if not cls.db:
            cls.db = AtlasDB(cls.db_path)
        else:
            cls.db.change_db(cls.db_path)

    @classmethod
    def insert_node(cls, node: Node) -> None:
        cls.db.insert_node(node)

    @classmethod
    def delete_node(cls, filepath: str) -> None:
        cls.db.delete_node(filepath)

    @classmethod
    def get_all_nodes(cls) -> list[Node]:
        if not cls.db:
            return []
        return cls.db.get_all_nodes()
