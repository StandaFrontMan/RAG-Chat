import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchMe, loginApi, logoutApi, registerApi } from "../../api/auth";
import { useAbortSignal } from "../shared/useAbortSignal";

export function useAuth() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const nextLoginSignal = useAbortSignal();
  const nextRegisterSignal = useAbortSignal();

	const {data: user, isLoading} = useQuery({
		queryKey: ['auth', 'me'],
		queryFn: ({signal}) => fetchMe(signal),
		staleTime: 1000 * 60 * 5
	})

	const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      loginApi(credentials, nextLoginSignal()),
		onSuccess: (data) => {
			queryClient.setQueryData(['auth', 'me'], data.user)
			navigate('/chat')
		}
	})

	const registerMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      registerApi(credentials, nextRegisterSignal()),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);
      navigate('/chat');
    },
  });

	const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear(); // очищаем кэш чатов и заметок
      navigate('/login');
    },
  });

	return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error?.message,
    logout: logoutMutation.mutate,
  };
}