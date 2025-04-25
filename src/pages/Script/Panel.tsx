import React, { useEffect } from 'react';
import { Layout } from 'antd';
import useTokenRenewal from '../../services/UseTokenRenewal';
import { useNavigate } from 'react-router-dom';
import PanelScript from '../../components/script/PanelScript';
import { useIsMobile } from '../../hooks/use-media-query';

const { Content } = Layout;

const ScriptPanel: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useTokenRenewal( navigate );

  useEffect(() => {
      if ( !localStorage.getItem('typeUser') || localStorage.getItem('typeUser') !== 'admin_user') navigate('/', { replace: true });
    }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: isMobile ? '12px' : '24px' }}>
              
        <PanelScript />

      </Content>
    </Layout>
  )
}

export default ScriptPanel;