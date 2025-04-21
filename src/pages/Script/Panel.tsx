import React from 'react';
import { Layout, Dropdown, Menu, Avatar, } from 'antd';
import { UserOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import useTokenRenewal from '../../services/UseTokenRenewal';
import { useNavigate } from 'react-router-dom';
import PanelScript from '../../components/script/PanelScript';

const { Header, Content } = Layout;

const ScriptPanel: React.FC = () => {
  const navigate = useNavigate();
  useTokenRenewal( navigate );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#ffffff', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}></div> {/* Esto ocupa el espacio disponible a la izquierda */}
        
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item key="1" icon={<ProfileOutlined />}>
                Perfil
              </Menu.Item>
              <Menu.Item key="2" icon={<LogoutOutlined />}>
                Cerrar sesión
              </Menu.Item>
            </Menu>
          } 
          placement="bottomRight"
        >
          <Avatar style={{ marginRight: '24px' }} icon={<UserOutlined />} />
        </Dropdown>
      </Header>

      <Content style={{ padding: '24px' }}>
              
        <PanelScript />

      </Content>
    </Layout>
  )
}

export default ScriptPanel;