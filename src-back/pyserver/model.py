import os
import sys
import pickle
from sentence_transformers import SentenceTransformer
from utils import NodeData, NewNodeData, Coordinates

COORDINATE_GEN = "umap.pkl"
SBERT = "sbert"


def get_model_dir() -> str:
    if getattr(sys, "frozen", False):
        return os.path.join(sys._MEIPASS, "models")
    else:
        return os.path.join(os.getcwd(), "src-back", "models")


class Model:
    def __init__(self):
        self.model_dir = get_model_dir()
        self.umap_dir = os.path.join(self.model_dir, COORDINATE_GEN)
        self.sbert_dir = os.path.join(self.model_dir, SBERT)

        print(f"Loading UMAP from: {self.umap_dir}")
        with open(self.umap_dir, "rb") as f:
            data = pickle.load(f)

        self.reducer = data["reducer"]
        self.scaler = data["scaler"]

        print(f"Loading sBERT from: {self.sbert_dir}")
        self.sbert = SentenceTransformer(self.sbert_dir)

        print("models initialized")

    def infer(self, node: NewNodeData) -> NodeData:
        embedding = self.sbert.encode(node.content)
        coordinates = self.reducer.transform(embedding.reshape(1, -1))
        scaled = self.scaler.transform(coordinates)
        x, y = scaled[0]

        full = NodeData(
            filepath=node.node.filepath,
            pos=Coordinates(x=x, y=y),
            cdt=node.node.cdt,
            mdt=node.node.mdt,
            col=node.node.col,
        )

        print(full)
        return full
