import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from store import Store
from utils import AppData, AtlasData, NodeData, NewNodeData, UpdateNodeRequest
from cli import parse_arguments


args = parse_arguments()
cors_origins = ["tauri://localhost", "http://tauri.localhost"]

if args.dev:
    sys.stdout.reconfigure(line_buffering=True)
    cors_origins.append(args.devurl)

app = FastAPI(
    title="knoto-backend-api",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/favicon.ico")
async def favicon():
    return {}


@app.get("/")
async def root():
    return {
        "message": f"pyserver backend API root. Head to 'http://localhost:{args.port}/docs' to test out routes in the browser."
    }


@app.get("/api/v1/connect")
async def connect():
    return {
        "message": f"connected to api server on port {args.port}. Refer to 'http://localhost:{args.port}/docs' for API docs.",
    }


@app.get("/api/v1/get-all-nodes")
async def get_all_nodes():
    nodes = Store.get_all_nodes()
    return {"nodes": nodes}


@app.post("/api/v1/set-app")
async def set_app(data: AppData):
    Store.set_app(data)
    print("backend initialized")
    print("data dir: ", Store.app.app_dir_data)


@app.post("/api/v1/set-atlas")
async def set_atlas(data: AtlasData):
    Store.set_atlas(data)
    return {"message": f"new atlas root dir set: {Store.atlas.root}"}


@app.post("/api/v1/add-nodes")
async def add_nodes(nodes: list[NewNodeData] | NewNodeData):
    results = Store.insert_nodes(nodes)
    return {"new": results}


@app.post("/api/v1/update-node")
async def update_node(request: UpdateNodeRequest):
    new = Store.update_node(request.current, request.updated)
    return {"new": new}


@app.delete("/api/v1/nodes/{filepath:path}")
async def delete_node(filepath: str):
    Store.delete_node(filepath)
    return {"message": f"node deleted in {Store.db_path}: {filepath}"}


def start_api_server():
    try:
        print("starting API server...")
        uvicorn.run(app, port=args.port)
        return True
    except HTTPException as e:
        print("failed to start API server")
        print(e)
        return False


if __name__ == "__main__":
    Store.init()
    start_api_server()
