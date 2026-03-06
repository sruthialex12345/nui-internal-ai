import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const token = params.get("token");
if (token) {
  localStorage.setItem("token", token);
  window.history.replaceState({}, document.title, "/");
}

const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);