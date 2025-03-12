from utils import NodeData
import random


class Model:
    model_instance: str

    def __init__(self):
        self.model_instance = "model"

    def infer(node: NodeData) -> NodeData:
        print("inferring: ", node.filepath)
        node.x = random.random()
        node.y = random.random()
        return node
