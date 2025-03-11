import sys
import sqlite3
import random
from datetime import datetime


class TestDataDB:
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

    def insert_random_node(self, filepath: str):
        now_str = datetime.now().isoformat()
        random_color = random.choice(["#8387f1", "#545ac1", "#2e3064"])
        query = """
        INSERT INTO nodes (filepath, x, y, cdt, mdt, col)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        params = (
            filepath,
            random.uniform(0, 1),
            random.uniform(0, 1),
            now_str,
            now_str,
            random_color,
        )
        self.execute(query, params)


def main():
    if len(sys.argv) != 3:
        print("Usage: python _generate_test_data.py <db_path> <number_of_nodes>")
        return

    db_path = sys.argv[1]
    number_of_nodes = int(sys.argv[2])

    db = TestDataDB(db_path)

    for i in range(number_of_nodes):
        filepath = f"path/to/node_{i}.md"
        db.insert_random_node(filepath)

    db.close()
    print(f"Inserted {number_of_nodes} nodes into {db_path}")


if __name__ == "__main__":
    main()
