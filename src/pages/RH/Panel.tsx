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

