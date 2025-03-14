import sys
import sqlite3
import random
import os
from os import sep
from datetime import datetime


class TestDataDB:
    def __init__(self, atlas_path: str):
        self.atlas_path = atlas_path
        self.db_path = atlas_path + sep + "atlas.db"
        self.notes_path = atlas_path + sep + "notes"
        self.connection = self._connect()
        self._ensure_nodes()
        self._ensure_notes_directory()

    def _ensure_notes_directory(self):
        if not os.path.exists(self.notes_path):
            os.makedirs(self.notes_path)
            print(f"Created notes directory at {self.notes_path}")

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

    def _generate_random_content(self, filepath):
        titles = [
            "Meeting Notes",
            "Project Ideas",
            "Thoughts",
            "Research",
            "To-Do List",
        ]
        paragraphs = [
            "This is a sample note with some content.",
            "Important ideas for future reference.",
            "Remember to follow up on these points.",
            "Key concepts discussed in the meeting.",
            "Questions that need answers later.",
        ]

        subtitle = random.choice(titles)
        content = [
            f"### {filepath}",
            "",
            f"# {subtitle}",
            random.choice(paragraphs),
            "",
            random.choice(paragraphs),
            "",
            f"Created on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        ]

        return "\n".join(content)

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

        # Create the actual markdown file
        file_content = self._generate_random_content(filepath)
        full_path = os.path.join(self.notes_path, filepath)
        with open(full_path, "w") as f:
            f.write(file_content)


def main():
    if len(sys.argv) != 3:
        print("Usage: python _generate_test_data.py <db_path> <number_of_nodes>")
        return

    db_path = sys.argv[1]
    number_of_nodes = int(sys.argv[2])

    db = TestDataDB(db_path)

    for i in range(number_of_nodes):
        filepath = f"node_{i}.md"
        db.insert_random_node(filepath)

    db.close()
    print(
        f"Inserted {number_of_nodes} nodes into {db_path} and created corresponding markdown files"
    )


if __name__ == "__main__":
    main()
