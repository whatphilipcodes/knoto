from utils import NodeData
import random


class Model:
    model_instance: str

    def __init__(self):
        self.model_instance = "model"

    def infer(self, node: NodeData) -> NodeData:
        print("inferring: ", node.filepath)
        node.pos.x = random.random()
        node.pos.y = random.random()
        return node
