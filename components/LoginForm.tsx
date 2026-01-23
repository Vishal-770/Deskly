import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Key, LogIn, HelpCircle } from "lucide-react";

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Logging in...");

    try {
      /** CALL LOGIN IPC  */
      const result = await window.login.authenticate({ username, password });

      if (result.success) {
        // Store cookies, authorizedID, and csrf for dashboard to use
        sessionStorage.setItem("vtp_cookies", result.cookies || "");
        sessionStorage.setItem("vtp_authorizedID", result.authorizedID || "");
        sessionStorage.setItem("vtp_csrf", result.csrf || "");

        /**
         * SET AUTH STATE IN STORE
         *
         */
        const response: boolean = await window.auth.login({
          userId: username,
          password,
        });

        const responseTokens: boolean = await window.auth.setTokens({
          authorizedID: result.authorizedID!,
          csrf: result.csrf!,
          cookies: result.cookies!,
        });

        /** CHECK IF AUTH STATE IS SET PROPERLY  else login failed*/

        if (response === false || responseTokens === false) {
          throw new Error("Authentication storage failed.");
        }
        
        /** REDIRECT TO DASHBOARD
         * IF LOGIN AND AUTH STORAGE SUCCESSFUL
         *
         */

        router.push("/dashboard");
      } else {
        setMessage(result.error || "Login failed");
      }
    } catch (error: unknown) {
      setMessage(
        "Login failed: " +
          (error instanceof Error ? error.message : String(error)),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Typography Watermark */}
      <div className="absolute top-12 right-12 text-[6rem] lg:text-[10rem] font-display font-extrabold text-foreground opacity-[0.03] pointer-events-none select-none leading-none z-0">
        DKLY
      </div>

      <div className="w-full max-w-[400px] relative z-10 flex flex-col gap-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-card text-foreground flex items-center justify-center border border-input rounded-sm shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-foreground leading-none">
            Welcome Back
          </h1>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            Please sign in to continue
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="group">
              <label
                htmlFor="reg-no"
                className="block text-[10px] font-bold uppercase tracking-widest text-foreground mb-1.5 ml-0.5"
              >
                Registration Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="reg-no"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full h-12 pl-4 pr-10 bg-card border border-input text-base font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 hover:border-primary/50 transition-all rounded-sm placeholder:uppercase placeholder:tracking-wider peer"
                  placeholder="21BCE1001"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-primary transition-colors pointer-events-none">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-widest text-foreground mb-1.5 ml-0.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-12 pl-4 pr-10 bg-card border border-input text-base font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 hover:border-primary/50 transition-all rounded-sm placeholder:tracking-widest peer"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-primary transition-colors pointer-events-none">
                  <Key className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {message && (
            <p className="text-sm text-destructive text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-bold uppercase tracking-widest border border-input focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:translate-y-[1px] rounded-sm shadow-sm group mt-2 disabled:opacity-70"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            {!loading && (
              <LogIn className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-semibold border-t border-border pt-5 mt-2">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Trouble logging in?
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
          >
            Privacy Policy
          </a>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 text-[9px] font-mono font-medium text-muted-foreground uppercase tracking-widest">
        <span>v2.4.0-stable</span>
      </div>
    </>
  );
};
