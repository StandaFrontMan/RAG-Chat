import { useAuth } from "../../../hooks/auth/useAuth";

export function useChatSidebarViewModel() {
  const { user, logout, isLoggingOut } = useAuth();

  function handleLogout() {
    logout();
  }

  return {
    user,
    isLoggingOut,
    handleLogout,
  };
}
