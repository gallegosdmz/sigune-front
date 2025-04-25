"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthProvider } from "./context/AuthContext"
import { useLocation } from "react-router-dom"
import SideNav from "./components/side-nav/SideNav"
import { TopNav } from "./components/top-nav/TopNav"
import AppRoutes from "./routes/AppRoutes"
import { useIsMobile } from "./hooks/use-media-query"

const App: React.FC = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === "/"
  const isMobile = useIsMobile()

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)

  // Cerrar sidebar automáticamente en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  // Actualizar estado del sidebar cuando cambia el tamaño de la pantalla
  useEffect(() => {
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <AuthProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {!isLoginPage && <TopNav toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />}

        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {!isLoginPage && (
            <>
              <SideNav isOpen={isSidebarOpen} />
              {/* Overlay para cerrar el sidebar en móviles */}
              <div
                className={`side-nav-overlay ${isMobile && isSidebarOpen ? "active" : ""}`}
                onClick={() => isMobile && setIsSidebarOpen(false)}
              />
            </>
          )}

          <div
            className="main-content content-wrapper"
            style={{
              marginLeft: !isLoginPage && !isMobile && isSidebarOpen ? "200px" : "0",
              flex: 1,
              overflowY: "auto",
              width: "100%",
            }}
          >
            <AppRoutes />
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
