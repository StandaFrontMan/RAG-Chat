import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocument as createDocumentApi,
  deleteDocument as deleteDocumentApi,
  fetchDocuments,
} from "../../api/documents";
import type { CreateDocumentDto, Document } from "../../types/document/types";

export function useDocuments() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: ({ signal }) => fetchDocuments(signal),
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateDocumentDto) => createDocumentApi(dto),
    onSuccess: (newDoc) => {
      queryClient.setQueryData<Document[]>(["documents"], (old) => {
        return old ? [newDoc, ...old] : [newDoc];
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentApi(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Document[]>(["documents"], (old) => {
        return old?.filter((doc) => doc.id !== deletedId) || [];
      });
    },
  });

  // Фильтрация документов по строке поиска
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return doc.title.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q);
  });

  return {
    documents: filteredDocuments,
    totalCount: documents.length,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    error: error?.message,
    createDocument: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
}
