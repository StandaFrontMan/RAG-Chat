export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  similarity?: number;
}

export interface CreateDocumentDto {
  title: string;
  content: string;
}
