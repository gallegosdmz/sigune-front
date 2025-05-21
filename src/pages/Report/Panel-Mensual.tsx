import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-media-query";
import useTokenRenewal from "../../services/UseTokenRenewal";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import ListReportsMensual from "../../components/report/ListReportMensual";

const ReportPanelMensual: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    useTokenRenewal(navigate);

    useEffect(() => {
        if (!localStorage.getItem('typeUser') || localStorage.getItem('typeUser') !== 'admin_user' && localStorage.getItem('typeUser') !== 'auxiliar_user' && localStorage.getItem('typeUser') !== 'view_newsletters')
            navigate('/', { replace: true });
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ padding: isMobile ? '12px' : '24px' }}>
                    
                <ListReportsMensual/>        

            </Content>
        </Layout>
    );
}

export default ReportPanelMensual;