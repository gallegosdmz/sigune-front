"use client"

import type React from "react"
import { HamburgerMenu } from "../menu/hamburger-menu"
import { useIsMobile } from "../../hooks/use-media-query"
import { useNavigate } from "react-router-dom"
import { Avatar, Dropdown, Menu } from "antd"
import { LogoutOutlined, UserOutlined } from "@ant-design/icons"

interface TopNavProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export const TopNav: React.FC<TopNavProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Implementa tu lógica de cierre de sesión aquí
    localStorage.removeItem("token")
    localStorage.removeItem("typeUser")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && <HamburgerMenu isOpen={isSidebarOpen} toggle={toggleSidebar} />}
        </div>

        <div className="flex items-center space-x-4">
          {/* Menú de usuario */}
          <Dropdown 
            overlay={
              <Menu>
                <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Cerrar sesión
                </Menu.Item>
              </Menu>
            } 
            placement="bottomRight"
          >
          <Avatar style={{ marginRight: '24px' }} icon={<UserOutlined />} />
         </Dropdown>
        </div>
      </div>
    </header>
  )
}
