import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 React app starting...");
console.log("Environment variables:", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "SET" : "NOT SET"
});

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  console.log("React root created successfully");
  
  root.render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("❌ Failed to start React app:", error);
}
