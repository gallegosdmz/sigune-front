import React from 'react';
import { Layout, Dropdown, Menu, Avatar, } from 'antd';
import { UserOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import useTokenRenewal from '../../services/UseTokenRenewal';
import { useNavigate } from 'react-router-dom';
import PanelUser from '../../components/user/PanelUser';
import PanelRole from '../../components/role/PanelRole';
import PanelDepartment from '../../components/department/PanelDepartment';

const { Header, Content } = Layout;


const HRPanel: React.FC = () => {
  const navigate = useNavigate();
  useTokenRenewal( navigate );

  return (
    <Layout>
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
              
        {/* COMPONENTE DE USERS */}
        <PanelUser/>
        
        {/* COMPONENTE DE ROLES */}
        <PanelRole/>
        
        {/* COMPONENTE DE DEPARTMENTS */}
        <PanelDepartment/>

      </Content>
    </Layout>
  );
};

export default HRPanel;

