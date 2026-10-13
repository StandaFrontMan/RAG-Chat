import { LoginForm } from "../feature";

export function AuthPage() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
	)
}