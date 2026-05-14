import { useState } from "react";
import { Link } from "react-router";
import { Ticket, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate error to show the red banner
    setError("Invalid email or password. Please try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      
      {/* Decorative premium techy background */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[400px] w-full bg-card p-8 sm:p-10 rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-border relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-8">
            <div className="text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">
              <Ticket className="w-8 h-8" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              TicketFlow
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {activeTab === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            {activeTab === "login" 
              ? "Enter your details to access your tickets." 
              : "Sign up to start booking premium events."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 space-x-1 bg-muted rounded-lg mb-8">
          <button
            onClick={() => { setActiveTab("login"); setError(null); }}
            className={clsx(
              "w-full py-2 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab("register"); setError(null); }}
            className={clsx(
              "w-full py-2 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Register
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {activeTab === "register" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors bg-input-background text-sm font-medium text-foreground"
                placeholder="Jane Doe"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors bg-input-background text-sm font-medium text-foreground"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
              required
              className="appearance-none block w-full px-4 py-3 border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors bg-input-background text-sm font-medium text-foreground"
              placeholder="••••••••"
            />
          </div>

          {activeTab === "login" && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-border rounded bg-input-background"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-muted-foreground">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-teal-500 hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-teal-500 transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
            >
              {activeTab === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">
            {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => {
              setActiveTab(activeTab === "login" ? "register" : "login");
              setError(null);
            }} 
            className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
          >
            {activeTab === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
