import { Button, Card, Col, Row, Input as SearchInput, Table } from 'antd';
import { WeeklySummary } from "../../interfaces/WeeklySummary";
import { useState, useEffect } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { handleSetWeeklySummarys } from '../../utils/WeeklySummaryUtils';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Search } = SearchInput;

const ListWeeklySummarys: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weeklySummarys, setWeeklySummarys] = useState<WeeklySummary[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        handleSetWeeklySummarys(setWeeklySummarys);
    }, []);

    const getDayName = (date: Date): string => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    };

    const formatDate = (dateString: string | Date): Date => {
        // Si ya es un Date, devolverlo directamente
        if (dateString instanceof Date) {
            return dateString;
        }
        // Crear la fecha en la zona horaria local para evitar desplazamientos
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month - 1 porque getMonth() es 0-based
    };

    const filteredWeeklySummarys = weeklySummarys.filter(
        (summary) =>
            formatDate(summary.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).toUpperCase().includes(searchTerm.toUpperCase())
    );

    const columns: ColumnsType<WeeklySummary> = [
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            render: (_, record) => {
                const date = formatDate(record.date);
                const dayName = getDayName(date);
                return `${dayName}, ${date.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}`;
            }
        },
        {
            title: 'Resúmenes Diarios',
            dataIndex: 'dailySummarys',
            key: 'dailySummarys',
            render: (_, record) => record.dailySummarys?.length || 0
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record: WeeklySummary) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/resumen-semanal/${record.id}`)}
                >
                    Ver Detalles
                </Button>
            ),
        },
    ];

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
                <Card title="Resúmenes Semanales">
                    <Search
                        placeholder="Buscar por fecha"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Table 
                        columns={columns} 
                        dataSource={filteredWeeklySummarys} 
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} resúmenes`
                        }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default ListWeeklySummarys; 