import React from "react"
import ReactDOM from "react-dom/client"
import { ConfigProvider } from "antd"
import App from "./App"
import { theme } from "./theme"
import "./index.css" // o el nombre de tu archivo CSS principal
import { BrowserRouter } from "react-router-dom"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
