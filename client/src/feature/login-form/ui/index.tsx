
import { cn } from "cn";
import { useLoginFormViewModel } from "../view-model/useLoginFormViewModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { mode, values, isLoading, error, handleChange, handleSubmit, toggleMode } =
    useLoginFormViewModel();

  const isLogin = mode === "login";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isLogin ? "Login to your account" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your email below to login to your account"
              : "Enter your details to create a new account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={values.email}
                  onChange={handleChange("email")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={values.password}
                  onChange={handleChange("password")}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={toggleMode}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
