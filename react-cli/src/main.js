import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/antd.less";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
