"use client"

import type React from "react"
import { Layout, Tabs } from "antd"
import { UserOutlined, TeamOutlined, BankOutlined } from "@ant-design/icons"
import useTokenRenewal from "../../services/UseTokenRenewal"
import { useNavigate } from "react-router-dom"
import PanelUser from "../../components/user/PanelUser"
import PanelRole from "../../components/role/PanelRole"
import PanelDepartment from "../../components/department/PanelDepartment"
import { useIsMobile } from "../../hooks/use-media-query"

const { Content } = Layout
const { TabPane } = Tabs

const HRPanel: React.FC = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  useTokenRenewal(navigate)

  return (
    <Layout>
      <Content style={{ padding: isMobile ? "12px" : "24px" }}>
        {isMobile ? (
          // Vista móvil con tabs
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Usuarios
                </span>
              }
              key="1"
            >
              <PanelUser />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <TeamOutlined />
                  Roles
                </span>
              }
              key="2"
            >
              <PanelRole />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <BankOutlined />
                  Departamentos
                </span>
              }
              key="3"
            >
              <PanelDepartment />
            </TabPane>
          </Tabs>
        ) : (
          // Vista de escritorio con componentes apilados
          <>
            {/* COMPONENTE DE USERS */}
            <PanelUser />

            {/* COMPONENTE DE ROLES */}
            <PanelRole />

            {/* COMPONENTE DE DEPARTMENTS */}
            <PanelDepartment />
          </>
        )}
      </Content>
    </Layout>
  )
}

export default HRPanel
