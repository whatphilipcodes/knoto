export interface AtlasData {
  root: string;
  subdir_nodes: string;
  id_database: string;
}

export interface AppData {
  app_dir_config: string;
  app_dir_data: string;
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
