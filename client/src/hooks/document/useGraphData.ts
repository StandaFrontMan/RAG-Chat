import { fetchGraphData } from "@/api/documents";
import type { GraphData } from "@/api/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useGraphData(initialThreshold: number = 0.5) {
	const [threshold, setThreshold] = useState(initialThreshold)

	const {
		data = {nodes: [], links: []},
		isLoading,
		isError,
		error,
		refetch
	} = useQuery<GraphData>({
		queryKey: ['graph', threshold],
		queryFn: ({signal}) => fetchGraphData(threshold, signal),
		staleTime: 1000 * 60 * 2, // 2 mins
	});

	return {
		nodes: data.nodes,
		links: data.links,
		threshold,
		setThreshold,
		isLoading,
		isError,
		error: error?.message,
		refetch
	}
}