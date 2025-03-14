export interface AtlasData {
  root: string;
  subdir_nodes: string;
  id_database: string;
}

export interface NodeData {
  filepath: string;
  pos: {
    x: number;
    y: number;
  };
  cdt: string;
  mdt: string;
  col: string;
}
