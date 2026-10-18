import { useState } from "react";
import { useAuth } from "../../../hooks/auth/useAuth";
import type { AuthMode, LoginFormValues } from "../model/types";

export function useLoginFormViewModel() {
  const {
    login,
    register,
    isLoggingIn,
    isRegistering,
    loginError,
    registerError,
    resetLoginError,
    resetRegisterError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });

  const isLoading = mode === "login" ? isLoggingIn : isRegistering;
  const error = mode === "login" ? loginError : registerError;

  function handleChange(field: keyof LoginFormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (loginError) resetLoginError();
      if (registerError) resetRegisterError();
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(values);
      } else {
        await register(values);
      }
    } catch {
      // Handled by react-query mutation error state
    }
  }

  function toggleMode() {
    resetLoginError();
    resetRegisterError();
    setMode((prev) => (prev === "login" ? "register" : "login"));
  }

  return {
    mode,
    values,
    isLoading,
    error,
    handleChange,
    handleSubmit,
    toggleMode,
  };
}
