import "./styles/clean.css";
import "./styles/menu.css";
import "./styles/contact.css";
import "./styles/hero.css";
import "./styles/intro.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
const root = document.getElementById("root")!;
if (root.children.length)
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  );
else
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
