import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, "", "/");
      navigate({ to: "/chat" });
      return;
    }
    const existing = localStorage.getItem("token");
    if (existing) {
      navigate({ to: "/chat", replace: true });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white font-sans">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/logo.png"
          alt="NUIGPT"
          className="w-20 h-20 object-contain"
        />
      </div>

      <h1 className="text-[32px] font-bold text-[#0d0d0d] mb-2 tracking-[-0.5px]">
        Welcome to NUIGPT
      </h1>
      <p className="text-[15px] text-[#6b6b6b] mb-10 text-center">
        Sign in to start chatting
      </p>

      <a
        href="http://localhost:3000/auth/google"
        className="flex items-center gap-3 bg-white border border-[#e5e5e5] rounded-[10px] px-6 py-3 text-[15px] font-medium text-[#0d0d0d] cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:bg-[#f9f9f9] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] no-underline"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.46 3.19 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.24l7.08 5.5C12.4 13.4 17.73 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.58C43.18 37.13 46.1 31.27 46.1 24.5z"
          />
          <path
            fill="#FBBC05"
            d="M10.72 28.26A14.6 14.6 0 0 1 9.5 24c0-1.48.26-2.9.72-4.26l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.56 10.72l8.16-6.46z"
          />
          <path
            fill="#34A853"
            d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.58c-1.82 1.22-4.14 1.94-6.32 1.94-6.27 0-11.6-3.9-13.28-9.24l-8.16 6.46C7.07 41.52 14.82 47 24 47z"
          />
        </svg>
        Continue with Google
      </a>

      <p className="text-xs text-[#8e8ea0] mt-8 text-center">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}
