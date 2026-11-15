import { createRoot } from "react-dom/client";
import App from "./components/lootzy/app";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<App />);