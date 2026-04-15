import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import FixedIncomeDashboard from "./App";
// import Dashboard from "./income";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <FixedIncomeDashboard />
  </React.StrictMode>,
);
