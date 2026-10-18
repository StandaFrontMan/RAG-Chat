import type { CreateDocumentDto, Document } from "../types/document/types";

const JSON_HEADERS = new Headers({
  "Content-Type": "application/json",
});

export async function fetchDocuments(signal?: AbortSignal): Promise<Document[]> {
  const res = await fetch("/api/documents", {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch documents");
  }

  return res.json();
}

export async function createDocument(
  dto: CreateDocumentDto,
  signal?: AbortSignal
): Promise<Document> {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    signal,
    body: JSON.stringify(dto),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create document");
  }

  return data;
}

export async function deleteDocument(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete document");
  }
}

export async function searchDocuments(
  query: string,
  signal?: AbortSignal
): Promise<Document[]> {
  const res = await fetch(`/api/documents/search?query=${encodeURIComponent(query)}`, {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to search documents");
  }

  return res.json();
}
