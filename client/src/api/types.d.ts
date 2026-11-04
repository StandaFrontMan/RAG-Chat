export interface GraphNode {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface GraphLink {
  source: string;
  target: string;
  similarity: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

