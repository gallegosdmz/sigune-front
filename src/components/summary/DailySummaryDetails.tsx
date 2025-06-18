import { Button, Card, Col, Row, Table, Typography } from 'antd';
import { DailySummary } from "../../interfaces/DailySummary";
import { Content } from "../../interfaces/Content";
import { useState, useEffect } from 'react';
import { EyeOutlined, MergeCellsOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getDailySummary } from '../../services/ApiCalls';
import { handleErrorServer } from '../../utils/Custom/CustomErrors';
import EditContent from '../contents/EditContent';
import MergeNotesModal from '../contents/MergeNotesModal';

const { Title } = Typography;

const DailySummaryDetails: React.FC = () => {
    const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<Content | null>(null);
    const [visibleViewNote, setVisibleViewNote] = useState(false);
    const [visibleViewSection, setVisibleViewSection] = useState(false);
    const [modalMergeNotes, setModalMergeNotes] = useState(false);
    const [file, setFile] = useState<any | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchDailySummary = async () => {
        try {
            if (id) {
                const data = await getDailySummary(parseInt(id));
                setDailySummary(data);
            }
        } catch (error) {
            handleErrorServer(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailySummary();
    }, [id]);

    const handleMergeSuccess = () => {
        fetchDailySummary();
    };

    const hasNotes = dailySummary?.contents && 
        Array.isArray(dailySummary.contents) && 
        dailySummary.contents.filter(content => 
            typeof content === 'object' && content.type === 'Nota'
        ).length >= 2;

    const columns: ColumnsType<Content> = [
        {
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Encabezado',
            dataIndex: 'head',
            key: 'head',
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Dependencia',
            dataIndex: 'dependence',
            key: 'dependence',
        },
        {
            title: 'Clasificación',
            dataIndex: 'classification',
            key: 'classification',
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record: Content) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setContent(record);
                        setFile(null);
                        if (record.type === 'Nota') {
                            setVisibleViewNote(true);
                        } else {
                            setVisibleViewSection(true);
                        }
                    }}
                >
                    Ver
                </Button>
            ),
        },
    ];

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!dailySummary) {
        return <div>No se encontró el resumen diario</div>;
    }

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={4}>
                            Resumen Diario - {new Date(dailySummary.date).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </Title>
                        {hasNotes && (
                            <Button
                                type="primary"
                                icon={<MergeCellsOutlined />}
                                onClick={() => setModalMergeNotes(true)}
                            >
                                Resumir Notas
                            </Button>
                        )}
                    </div>
                    <Table 
                        columns={columns} 
                        dataSource={dailySummary.contents as Content[]} 
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} contenidos`
                        }}
                    />
                </Card>
            </Col>

            <EditContent
                content={content}
                script={null}
                file={file}
                setFile={setFile}
                setContents={async (contents) => {
                    try {
                        await fetchDailySummary();
                    } catch (error) {
                        handleErrorServer(error);
                    }
                }}
                setVisibleViewNote={setVisibleViewNote}
                setVisibleViewSection={setVisibleViewSection}
                visibleViewNote={visibleViewNote}
                visibleViewSection={visibleViewSection}
            />

            <MergeNotesModal
                setModalMergeNotes={setModalMergeNotes}
                modalMergeNotes={modalMergeNotes}
                contents={dailySummary?.contents as Content[] || []}
                dailySummaryId={dailySummary?.id || 0}
                onSuccess={handleMergeSuccess}
            />
        </Row>
    );
};

export default DailySummaryDetails; 