import React from 'react';
import { Layout } from 'antd';
import useTokenRenewal from '../../services/UseTokenRenewal';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/use-media-query';
import ListContents from '../../components/script/ListContents';

const { Content } = Layout;

const ReporterosPanel: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useTokenRenewal( navigate );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: isMobile ? '12px' : '24px' }}>
              
        <ListContents />

      </Content>
    </Layout>
  )
}

export default ReporterosPanel;