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
      <Content style={{ padding: '24px' }}>
              
        <PanelScript />

      </Content>
    </Layout>
  )
}

export default ScriptPanel;