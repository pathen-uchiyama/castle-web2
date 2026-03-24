import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CORRECT_PASSWORD = "PLAID2026";
const STORAGE_KEY = "cc-auth";

export const usePasswordAuth = () => {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  const authenticate = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  return { authenticated, authenticate };
};

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, authenticate } = usePasswordAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticate(value.trim())) {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(30, 33%, 96%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-sm w-full"
      >
        <p
          className="mb-3 tracking-[0.35em] uppercase text-xs"
          style={{ color: "hsl(222, 20%, 45%)", fontFamily: "Inter, system-ui, sans-serif" }}
        >
          Castle Companion
        </p>
        <h1
          className="text-3xl sm:text-4xl mb-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400,
            color: "hsl(222, 47%, 21%)",
          }}
        >
          Private Preview
        </h1>
        <div className="w-10 h-px mx-auto my-5" style={{ background: "hsl(43, 69%, 52%)" }} />
        <p
          className="text-sm mb-8"
          style={{ fontFamily: "Inter, system-ui, sans-serif", color: "hsl(222, 20%, 45%)" }}
        >
          Enter the access code to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Access code"
            className="w-full px-4 py-3 rounded-lg text-sm text-center tracking-widest border outline-none transition-colors duration-300"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              background: "hsl(0, 0%, 100%)",
              color: "hsl(222, 47%, 21%)",
              borderColor: error ? "hsl(0, 70%, 55%)" : "hsl(0, 0%, 88%)",
            }}
            autoFocus
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: "hsl(0, 70%, 55%)" }}
            >
              Incorrect code. Please try again.
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 500,
              background: "hsl(222, 47%, 21%)",
              color: "hsl(30, 33%, 96%)",
              border: "1px solid hsl(43, 65%, 42%)",
            }}
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
