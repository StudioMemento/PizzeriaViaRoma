import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./styles/v18-base.css";
import "./styles/v18-app.css";
import "./styles/v18-polish.css";
import "./styles/v18-refine.css";
import "./styles/polish.css";
import "./styles/v20.css";
import "./styles/effects-v21.css";
import "./styles/interactions-v21.css";
import "./styles/design-v21.css";
import "./styles/effects-v22.css";
import "./styles/interactions-v22.css";
import "./styles/design-v22.css";
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
