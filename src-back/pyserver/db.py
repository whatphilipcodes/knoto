from utils import Node, Coordinates
from datetime import datetime
import sqlite3


class AtlasDB:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.connection = self._connect()
        self._ensure_nodes()

    def _ensure_nodes(self):
        query = """
        CREATE TABLE IF NOT EXISTS nodes (
            filepath TEXT PRIMARY KEY,
            x REAL NOT NULL,
            y REAL NOT NULL,
            created TEXT NOT NULL
        )
        """
        self.execute(query)

    def _connect(self):
        try:
            return sqlite3.connect(self.db_path)
        except sqlite3.OperationalError as e:
            raise sqlite3.OperationalError(
                f"Unable to open database file at {self.db_path}: {e}"
            )

    def execute(self, query: str, params: tuple = ()):
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        self.connection.commit()
        return cursor

    def close(self):
        self.connection.close()

    def change_db(self, new_db_path: str):
        self.close()
        self.db_path = new_db_path
        self.connection = self._connect()
        self._ensure_nodes()

    def insert_nodes(self, nodes):
        if not isinstance(nodes, list):
            nodes = [nodes]

        query = """
        INSERT INTO nodes (filepath, x, y, created)
        VALUES (?, ?, ?, ?)
        """

        for node in nodes:
            params = (
                node.filepath,
                node.coordinates.x,
                node.coordinates.y,
                node.created.isoformat(),
            )
            self.execute(query, params)

    def get_all_nodes(self):
        query = "SELECT filepath, x, y, created FROM nodes"
        cursor = self.execute(query)
        nodes = []

        for row in cursor.fetchall():
            filepath, x, y, created = row
            node = Node(
                filepath=filepath,
                coordinates=Coordinates(x=x, y=y),
                created=datetime.fromisoformat(created),
            )
            nodes.append(node)

        return nodes

    def delete_node(self, filepath: str):
        query = "DELETE FROM nodes WHERE filepath = ?"
        params = (filepath,)
        self.execute(query, params)
