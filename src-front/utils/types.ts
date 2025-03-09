export interface AtlasData {
  root: string;
  id_database: string;
}

export interface Node {
  filepath: string;
  coordinates: { x: number; y: number };
  created: string;
}
