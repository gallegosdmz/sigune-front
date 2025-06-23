import { Button, Card, Col, Row, Table, Typography, message } from 'antd';
import { WeeklySummary } from "../../interfaces/WeeklySummary";
import { DailySummary } from "../../interfaces/DailySummary";
import { Content } from "../../interfaces/Content";
import { useState, useEffect } from 'react';
import { EyeOutlined, FileWordOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getWeeklySummary } from '../../services/ApiCalls';
import { handleErrorServer } from '../../utils/Custom/CustomErrors';
import EditContent from '../contents/EditContent';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Header, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

const { Title } = Typography;

const WeeklySummaryDetails: React.FC = () => {
    const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<Content | null>(null);
    const [visibleViewNote, setVisibleViewNote] = useState(false);
    const [visibleViewSection, setVisibleViewSection] = useState(false);
    const [file, setFile] = useState<any | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();

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

    const getLogoBuffer = async () => {
        const response = await fetch(
          "https://res.cloudinary.com/gallegos-dev/image/upload/v1747338557/Captura_de_pantalla_2025-05-15_134857_exjtsy.png",
        )
        const blob = await response.blob()
        return await blob.arrayBuffer()
    }

    const parseHtmlToDocxRuns = (html: string): Paragraph[] => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const paragraphs: Paragraph[] = [];

        tempDiv.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: node.textContent || '',
                                font: 'Arial',
                                size: 24,
                            }),
                        ],
                        spacing: { after: 100 },
                    })
                );
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.tagName === 'P') {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: element.textContent || '',
                                    font: 'Arial',
                                    size: 24,
                                }),
                            ],
                            spacing: { after: 100 },
                        })
                    );
                }
            }
        });

        return paragraphs;
    };

    const exportToWord = async () => {
        if (!weeklySummary) return;

        const logoBuffer = await getLogoBuffer();

        const image = new ImageRun({
            data: logoBuffer,
            transformation: {
                width: 400,
                height: 60,
            },
            type: "png",
        });

        const imageParagraph = new Paragraph({
            children: [image],
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
        });

        const title = new Paragraph({
            children: [
                new TextRun({
                    text: "RESUMEN SEMANAL",
                    bold: true,
                    size: 26,
                    font: 'Arial',
                }),
                new TextRun({
                    text: getDayName(formatDate(weeklySummary.date)),
                    bold: true,
                    size: 26,
                    font: 'Arial',
                    break: 1
                }),
                new TextRun({
                    text: formatDate(weeklySummary.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }).toUpperCase(),
                    bold: true,
                    size: 26,
                    font: 'Arial',
                    break: 1
                }),
            ],
            heading: HeadingLevel.TITLE,
            spacing: { after: 300 },
            alignment: AlignmentType.CENTER
        });

        const contentParagraphs = weeklySummary.dailySummarys?.flatMap((dailySummary, dailyIndex) => {
            const dailyHeader = new Paragraph({
                children: [
                    new TextRun({
                        text: `Resumen Diario ${dailyIndex + 1}`,
                        bold: true,
                        break: 1,
                        font: 'Arial',
                        size: 26,
                    }),
                    new TextRun({
                        text: formatDate(dailySummary.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        }),
                        break: 1,
                        font: 'Arial',
                        size: 26,
                    }),
                ],
                spacing: { after: 200 },
            });

            const contentsParagraphs = dailySummary.contents?.flatMap((content, contentIndex) => {
                if (typeof content === 'number') return [];
                
                const contentHeader = new Paragraph({
                    children: [
                        new TextRun({
                            text: `${contentIndex + 1}. ${content.type} - ${content.title}`,
                            bold: true,
                            break: 1,
                            font: 'Arial',
                            size: 26,
                        }),
                    ],
                    spacing: { after: 100 },
                });

                const contentParagraphs = parseHtmlToDocxRuns(content.textContent);

                return [contentHeader, ...contentParagraphs];
            }) || [];

            return [dailyHeader, ...contentsParagraphs];
        }) || [];

        const signatureLine = new Paragraph({
            children: [
                new TextRun({
                    text: "_____________________________________",
                    font: "Arial",
                    size: 24,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 100 },
        });

        const signatureName = new Paragraph({
            children: [
                new TextRun({
                    text: "Lic. Martha Gabriela Yeverino Sifuentes",
                    font: "Arial",
                    size: 24,
                }),
            ],
            alignment: AlignmentType.CENTER,
        });

        const signaturePosition = new Paragraph({
            children: [
                new TextRun({
                    text: "Jefa del Departamento de Noticias",
                    font: "Arial",
                    size: 24,
                }),
            ],
            alignment: AlignmentType.CENTER,
        });

        const doc = new Document({
            creator: "SIGUNE",
            title: "Resumen Semanal",
            description: "Exportación de resumen semanal",
            sections: [
                {
                    headers: {
                        default: new Header({
                            children: [imageParagraph],
                        }),
                    },
                    children: [title, ...contentParagraphs, signatureLine, signatureName, signaturePosition],
                },
            ],
        });

        message.success('Resumen semanal exportado correctamente');

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `RESUMEN_SEMANAL_${formatDate(weeklySummary.date).toISOString().split('T')[0]}.docx`);
    };

    const fetchWeeklySummary = async () => {
        try {
            if (id) {
                const data = await getWeeklySummary(parseInt(id));
                console.log(data);
                setWeeklySummary(data);
            }
        } catch (error) {
            handleErrorServer(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeeklySummary();
    }, [id]);

    const columns: ColumnsType<DailySummary> = [
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => {
                const dateObj = formatDate(date);
                const dayName = getDayName(dateObj);
                return `${dayName}, ${dateObj.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}`;
            }
        },
        {
            title: 'Contenidos',
            dataIndex: 'contents',
            key: 'contents',
            render: (contents: Content[]) => contents?.length || 0
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record: DailySummary) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/resumen-diario/${record.id}`)}
                >
                    Ver Detalles
                </Button>
            ),
        },
    ];

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!weeklySummary) {
        return <div>No se encontró el resumen semanal</div>;
    }

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={4}>
                            Resumen Semanal - {(() => {
                                const date = formatDate(weeklySummary.date);
                                const dayName = getDayName(date);
                                return `${dayName}, ${date.toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}`;
                            })()}
                        </Title>
                        <Button
                            type="primary"
                            icon={<FileWordOutlined />}
                            onClick={exportToWord}
                        >
                            Exportar a Word
                        </Button>
                    </div>
                    <Table 
                        columns={columns} 
                        dataSource={weeklySummary.dailySummarys || []} 
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} resúmenes diarios`
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
                        await fetchWeeklySummary();
                    } catch (error) {
                        handleErrorServer(error);
                    }
                }}
                setVisibleViewNote={setVisibleViewNote}
                setVisibleViewSection={setVisibleViewSection}
                visibleViewNote={visibleViewNote}
                visibleViewSection={visibleViewSection}
            />
        </Row>
    );
};

export default WeeklySummaryDetails; 