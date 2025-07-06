import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Analytics } from '@vercel/analytics/next';
{children}
<Analytics />
createRoot(document.getElementById("root")!).render(<App />);
