"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BookOutlined, FileOutlined, ScanOutlined, UserOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu, Typography } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { useIsMobile } from "../../hooks/use-media-query"

const { Sider } = Layout
const { Title } = Typography

type MenuItem = Required<MenuProps>["items"][number]

interface SideNavProps {
  isOpen: boolean
}

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group",
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem
}

const SideNav: React.FC<SideNavProps> = ({ isOpen }) => {
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useIsMobile()

  const navigate = useNavigate()
  const location = useLocation()

  // En dispositivos móviles, no permitimos colapsar manualmente
  useEffect(() => {
    if (!isMobile) {
      // Solo permitir colapsar en dispositivos no móviles
    } else {
      setCollapsed(false) // En móviles siempre mostramos el menú completo cuando está abierto
    }
  }, [isMobile])

  let items: MenuProps["items"] = []

  const allowedRoutes = ["/panel-guion", "/panel-rh", "/panel-reporteros", "/panel-newsletters", "/panel-reports", "/panel-respaldo", "/panel-reports-mensuales"]

  const showSideNav = allowedRoutes.some((route) => location.pathname.startsWith(route))
  if (!showSideNav) return null

  if (localStorage.getItem("typeUser") === "admin_user") {
    items = [
      getItem("Guiones", "/panel-guion", <BookOutlined />),
      getItem("Boletines", "boletines", <FileOutlined />, [
        getItem("Listar Boletines", "/panel-newsletters"),
        getItem("Respaldo", "/panel-respaldo")
      ]),
      getItem("Usuarios", "/panel-rh", <UserOutlined />),
      getItem("Reportes", "reportes", <ScanOutlined />, [
        getItem("Mensuales", "/panel-reports-mensuales"),
        getItem("Trimestrales", "/panel-reports")
      ])
    ];
  } else if (localStorage.getItem('typeUser') === 'editor_user') {
    items = [getItem("Guiones", "/panel-guion", <BookOutlined />)]
  } else if (localStorage.getItem('typeUser') === 'reportero_user') {
    items = [getItem("Guiones", "/panel-reporteros", <BookOutlined />)]
  } else if (localStorage.getItem('typeUser') === 'locutor_user') {
    items = [getItem("Boletines", "/panel-newsletters", <FileOutlined/>)]
  }

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className={isMobile ? `${isOpen ? "open" : ""}` : ""}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        transition: "all 0.3s ease",
      }}
      theme="light"
    >
      <Title
        level={2}
        style={{
          margin: "16px 24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          marginTop: isMobile ? "64px" : "16px", // Ajustar para el TopNav en móviles
        }}
      >
        <img src={`/img/logo.png`} alt="Logo" style={{ height: "31px" }} />
      </Title>
      <div className="demo-logo-vertical" />
      <Menu
        theme="light"
        style={{ marginTop: "5px" }}
        mode="inline"
        items={items}
        selectedKeys={[location.pathname]} // <- Aquí seleccionas el menú actual
        onClick={(e) => navigate(e.key)}
      />
    </Sider>
  )
}

export default SideNav
