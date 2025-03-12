from utils import NodeData, Coordinates
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
            cdt TEXT NOT NULL,
            mdt TEXT NOT NULL,
            col TEXT NOT NULL
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

    def insert_node(self, node: NodeData):
        query = """
        INSERT INTO nodes (filepath, x, y, cdt, mdt, col)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        params = (
            node.filepath,
            node.pos.x,
            node.pos.y,
            node.cdt,
            node.mdt,
            node.col,
        )
        self.execute(query, params)

    def update_node(self, node: NodeData):
        query = """
        UPDATE nodes
        SET x = ?, y = ?, cdt = ?, mdt = ?, col = ?
        WHERE filepath = ?
        """
        params = (node.pos.x, node.pos.y, node.cdt, node.mdt, node.col, node.filepath)
        self.execute(query, params)

    # to-do: chunked stream apporach
    def get_all_nodes(self):
        query = "SELECT filepath, x, y, cdt, mdt, col FROM nodes"
        cursor = self.execute(query)
        nodes: list[NodeData] = []

        for row in cursor.fetchall():
            filepath, x, y, cdt, mdt, col = row
            node = NodeData(
                filepath=filepath, pos=Coordinates(x=x, y=y), cdt=cdt, mdt=mdt, col=col
            )
            nodes.append(node)

        return nodes

    def delete_node(self, filepath: str):
        query = "DELETE FROM nodes WHERE filepath = ?"
        params = (filepath,)
        self.execute(query, params)
