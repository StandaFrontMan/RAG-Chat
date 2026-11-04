import { fetchGraphData } from "@/api/documents";
import type { GraphData } from "@/api/types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useGraphData(initialThreshold: number = 0.5) {
	const [threshold, setThreshold] = useState(initialThreshold);
	const [debouncedThreshold, setDebouncedThreshold] = useState(initialThreshold);

	// Дебаунс 250ms, чтобы не спамить сеть и сервер запросами при движении ползунка
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedThreshold(threshold);
		}, 250);
		return () => clearTimeout(timer);
	}, [threshold]);

	const {
		data = { nodes: [], links: [] },
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useQuery<GraphData>({
		queryKey: ["graph", debouncedThreshold],
		queryFn: ({ signal }) => fetchGraphData(debouncedThreshold, signal),
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 2, // 2 mins
	});

	return {
		nodes: data.nodes,
		links: data.links,
		threshold,
		setThreshold,
		isLoading,
		isFetching,
		isError,
		error: error?.message,
		refetch,
	};
}
