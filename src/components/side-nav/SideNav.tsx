"use client"

import type React from "react"
import { useState } from "react"
import { BookOutlined, UserOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu, Typography } from "antd"
import { useLocation, useNavigate } from "react-router-dom"

const { Sider } = Layout
const { Title } = Typography

type MenuItem = Required<MenuProps>["items"][number]

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem
}

//const items: MenuItem[] = [
  
  //getItem('Option 2', '2', <DesktopOutlined />),
  //getItem('User', 'sub1', <UserOutlined />, [
  //getItem('Tom', '3'),
  //getItem('Bill', '4'),
  //getItem('Alex', '5'),
  //]),
  //getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),x
//]

const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false)

  const navigate = useNavigate();
  const location = useLocation();

  let items: MenuProps['items'] = [];

  const allowedRoutes = [
    '/panel-guion',
    '/panel-rh'
  ];

  const showSideNav = allowedRoutes.some((route) => location.pathname.startsWith(route));
  if ( !showSideNav ) return null;

  if ( localStorage.getItem('typeUser') === 'admin_user' ) {
    items = [
      getItem("Guiones", "/panel-guion", <BookOutlined />),
      getItem("Usuarios", "/panel-rh", <UserOutlined />),
    ];
  } else {
    return null;
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
      theme="light"
    >
      <Title
        level={2}
        style={{
          margin: "16px 24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <img src={`/img/logo.png`} alt="Logo" style={{ height: "40px" }} />
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
