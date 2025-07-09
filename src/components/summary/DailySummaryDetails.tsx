import { Button, Card, Col, Row, Table, Typography, message, Dropdown, MenuProps, Upload, Modal } from 'antd';
import { DailySummary } from "../../interfaces/DailySummary";
import { Content } from "../../interfaces/Content";
import { useState, useEffect } from 'react';
import { EyeOutlined, MergeCellsOutlined, FileWordOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getDailySummary, updateContent } from '../../services/ApiCalls';
import { handleErrorServer } from '../../utils/Custom/CustomErrors';
import EditContent from '../contents/EditContent';
import MergeNotesModal from '../contents/MergeNotesModal';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Header, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { css } from '@emotion/css';
import mammoth from 'mammoth';

const { Title } = Typography;

const DailySummaryDetails: React.FC = () => {
    const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<Content | null>(null);
    const [visibleViewNote, setVisibleViewNote] = useState(false);
    const [visibleViewSection, setVisibleViewSection] = useState(false);
    const [modalMergeNotes, setModalMergeNotes] = useState(false);
    const [modalImportWord, setModalImportWord] = useState(false);
    const [modalPreviewImport, setModalPreviewImport] = useState(false);
    const [file, setFile] = useState<any | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [previewContents, setPreviewContents] = useState<Partial<Content>[]>([]);
    const [importedFile, setImportedFile] = useState<File | null>(null);
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
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;

        const paragraphs: Paragraph[] = [];

        // Función para procesar nodos recursivamente
        const processNode = (node: Node, parentTag?: string): (TextRun | 'BREAK')[] => {
            const runs: (TextRun | 'BREAK')[] = [];

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || "";
                if (text.trim()) {
                    runs.push(
                        new TextRun({
                            text: text,
                            font: "Arial",
                            size: 24,
                            bold: parentTag === "b" || parentTag === "strong",
                            italics: parentTag === "i" || parentTag === "em",
                        })
                    );
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const tag = el.tagName.toLowerCase();

                if (tag === "br") {
                    runs.push('BREAK');
                } else if (tag === "p" || tag === "div") {
                    // Procesar contenido del párrafo/div
                    el.childNodes.forEach(childNode => {
                        runs.push(...processNode(childNode, tag));
                    });
                    // Agregar salto de línea después del párrafo
                    runs.push('BREAK');
                } else {
                    // Procesar elementos inline (span, strong, b, i, em, etc.)
                    el.childNodes.forEach(childNode => {
                        runs.push(...processNode(childNode, tag));
                    });
                }
            }

            return runs;
        };

        // Procesar todo el contenido del wrapper
        const allRuns: (TextRun | 'BREAK')[] = [];
        wrapper.childNodes.forEach(node => {
            allRuns.push(...processNode(node));
        });

        // Dividir en párrafos basándose en los saltos de línea
        let currentParagraphRuns: TextRun[] = [];
        
        allRuns.forEach((item, index) => {
            if (item === 'BREAK') {
                // Si hay contenido en el párrafo actual, crear el párrafo
                if (currentParagraphRuns.length > 0) {
                    paragraphs.push(
                        new Paragraph({
                            children: currentParagraphRuns,
                            spacing: { after: 100, line: 276 } // 1.15 line spacing
                        })
                    );
                    currentParagraphRuns = [];
                }
            } else {
                currentParagraphRuns.push(item);
            }
        });

        // Agregar el último párrafo si hay contenido
        if (currentParagraphRuns.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: currentParagraphRuns,
                    spacing: { after: 100, line: 276 } // 1.15 line spacing
                })
            );
        }

        // Si no se generaron párrafos, crear uno con el texto plano
        if (paragraphs.length === 0) {
            const text = wrapper.textContent || html;
            if (text.trim()) {
                // Preservar saltos de línea del texto original
                const lines = text.split(/\n/);
                lines.forEach(line => {
                    if (line.trim()) {
                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: line,
                                        font: "Arial",
                                        size: 24,
                                    }),
                                ],
                                spacing: { after: 100, line: 276 }, // 1.15 line spacing
                            })
                        );
                    }
                });
            }
        }

        return paragraphs;
    };

    const exportToWord = async () => {
        if (!dailySummary) return;

        const logoBuffer = await getLogoBuffer();

        const image = new ImageRun({
            data: logoBuffer,
            transformation: {
                width: 500,
                height: 60,
            },
            type: "png",
        });

        const imageParagraph = new Paragraph({
            children: [image],
            alignment: "center",
            spacing: { after: 200 },
        });

        const title = new Paragraph({
            children: [
                new TextRun({
                    text: "RESUMEN DIARIO",
                    bold: true,
                    size: 26,
                    font: 'Arial',
                }),
                new TextRun({
                    text: getDayName(formatDate(dailySummary.date)),
                    bold: true,
                    size: 26,
                    font: 'Arial',
                    break: 1
                }),
                new TextRun({
                    text: formatDate(dailySummary.date).toLocaleDateString("es-ES", {
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

        const contentParagraphs = dailySummary.contents?.flatMap((content, contentIndex) => {
            if (typeof content === 'number') return [];
            
            const paragraphs: Paragraph[] = [];
            
            // Contar todos los elementos para numeración secuencial
            const sequentialCount = dailySummary.contents!.slice(0, contentIndex + 1).filter(c => 
                typeof c === 'object' && (c.type === 'Nota' || c.type === 'Sección')
            ).length;
            
            // Título del contenido
            const headerParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: `${sequentialCount}.- ${content.title}`,
                        bold: true,
                        break: 1,
                        font: 'Arial',
                        size: 26,
                    }),
                ],
                spacing: { after: 100 },
            });
            paragraphs.push(headerParagraph);
            
            // Cabeza del contenido
            const headParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: content.head,
                        font: 'Arial',
                        size: 24,
                    }),
                ],
                spacing: { after: 100 },
            });
            paragraphs.push(headParagraph);
            
            // Contenido del texto
            const contentParagraphs = parseHtmlToDocxRuns(content.textContent);
            paragraphs.push(...contentParagraphs);
            
            // Agregar el nombre completo del usuario debajo del contenido
            if (content.user && typeof content.user === 'object' && 'name' in content.user && 'surname' in content.user) {
                const user = content.user as any;
                const userParagraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: `${user.name} ${user.surname}`,
                            font: 'Arial',
                            size: 20,
                            italics: true,
                        }),
                    ],
                    spacing: { before: 100, after: 200 },
                    alignment: AlignmentType.RIGHT,
                });
                paragraphs.push(userParagraph);
            }
            
            // Agregar línea horizontal de separación después de cada contenido
            const separatorParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: "_________________________________________________________________________________",
                        font: "Arial",
                        size: 20,
                    }),
                ],
                spacing: { before: 200, after: 200 },
                alignment: AlignmentType.CENTER,
            });
            paragraphs.push(separatorParagraph);

            return paragraphs;
        }) || [];

        // Firma al final del documento
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
            title: "Resumen Diario",
            description: "Exportación de resumen diario",
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

        message.success('Resumen diario exportado correctamente');

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `RESUMEN_DIARIO_${formatDate(dailySummary.date).toISOString().split('T')[0]}.docx`);
    };

    const detectContentType = (title: string, head: string, textContent: string): string => {
        // Palabras clave que indican que es una sección
        const sectionKeywords = ['sección', 'section', 'programa', 'program', 'especial', 'special', 'reportaje', 'report'];
        
        const allText = `${title} ${head} ${textContent}`.toLowerCase();
        
        for (const keyword of sectionKeywords) {
            if (allText.includes(keyword)) {
                return 'Sección';
            }
        }
        
        return 'Nota';
    };

    const parseWordDocument = async (file: File): Promise<Partial<Content>[]> => {
        // Leer el archivo de Word
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        // Parsear el contenido del documento
        const lines = text.split('\n').filter(line => line.trim());
        
        const contents: Partial<Content>[] = [];
        let currentContent: Partial<Content> | null = null;
        let currentTextContent = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detectar si es un título de contenido (formato: "1.- Título")
            const titleMatch = line.match(/^(\d+)\.-\s*(.+)$/);
            
            if (titleMatch) {
                // Si hay un contenido anterior, guardarlo
                if (currentContent && currentTextContent.trim()) {
                    currentContent.textContent = currentTextContent.trim();
                    // Detectar el tipo de contenido
                    currentContent.type = detectContentType(
                        currentContent.title || '', 
                        currentContent.head || '', 
                        currentContent.textContent || ''
                    );
                    contents.push(currentContent);
                }
                
                // Iniciar nuevo contenido
                currentContent = {
                    type: 'Nota', // Se determinará al final
                    title: titleMatch[2],
                    head: '', // Se llenará con la siguiente línea
                    textContent: '',
                    dependence: 'Importado',
                    classification: 'Importado',
                    status: true,
                };
                currentTextContent = '';
            } else if (currentContent && !currentContent.head && line && !line.includes('_____________________________________')) {
                // La primera línea después del título es el encabezado
                currentContent.head = line;
            } else if (currentContent && line && !line.includes('_____________________________________')) {
                // Agregar al contenido del texto
                if (currentTextContent) {
                    currentTextContent += '\n';
                }
                currentTextContent += line;
            }
        }

        // Agregar el último contenido si existe
        if (currentContent && currentTextContent.trim()) {
            currentContent.textContent = currentTextContent.trim();
            // Detectar el tipo de contenido
            currentContent.type = detectContentType(
                currentContent.title || '', 
                currentContent.head || '', 
                currentContent.textContent || ''
            );
            contents.push(currentContent);
        }

        return contents;
    };

    const importFromWord = async (file: File) => {
        if (!dailySummary) return;

        try {
            setImportLoading(true);
            
            // Parsear el documento
            const parsedContents = await parseWordDocument(file);
            
            // Mostrar preview
            setPreviewContents(parsedContents);
            setImportedFile(file);
            setModalImportWord(false);
            setModalPreviewImport(true);
            
        } catch (error) {
            console.error('Error al procesar documento:', error);
            message.error('Error al procesar el documento de Word');
            handleErrorServer(error);
        } finally {
            setImportLoading(false);
        }
    };

    const confirmImport = async () => {
        if (!dailySummary || !importedFile) return;

        try {
            setImportLoading(true);
            
            // Actualizar los contenidos existentes con los nuevos datos
            if (dailySummary.contents && Array.isArray(dailySummary.contents)) {
                const existingContents = dailySummary.contents.filter(c => typeof c === 'object') as Content[];
                
                for (let i = 0; i < Math.min(previewContents.length, existingContents.length); i++) {
                    const newContent = previewContents[i];
                    const existingContent = existingContents[i];
                    
                    if (newContent && existingContent) {
                        await updateContent(existingContent.id!, {
                            ...existingContent,
                            title: newContent.title || existingContent.title,
                            head: newContent.head || existingContent.head,
                            textContent: newContent.textContent || existingContent.textContent,
                        });
                    }
                }
            }

            message.success('Documento de Word importado correctamente');
            setModalPreviewImport(false);
            setPreviewContents([]);
            setImportedFile(null);
            fetchDailySummary(); // Recargar los datos
            
        } catch (error) {
            console.error('Error al importar documento:', error);
            message.error('Error al importar el documento de Word');
            handleErrorServer(error);
        } finally {
            setImportLoading(false);
        }
    };

    const handleFileUpload = (file: File) => {
        const isWord = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                      file.name.endsWith('.docx') || 
                      file.name.endsWith('.doc');
        
        if (!isWord) {
            message.error('Por favor selecciona un archivo de Word (.docx o .doc)');
            return false;
        }
        
        importFromWord(file);
        return false; // Prevenir el comportamiento por defecto
    };

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

    const handleMenuClick = (e: { key: string }) => {
        switch (e.key) {
            case "1":
                exportToWord();
                break;
            case "2":
                setModalMergeNotes(true);
                break;
            case "3":
                setModalImportWord(true);
                break;
        }
    };

    let items: MenuProps["items"] = [
        {
            key: "1",
            label: "Exportar a Word",
            icon: <FileWordOutlined />,
            onClick: handleMenuClick,
        },
        {
            key: "3",
            label: "Importar desde Word",
            icon: <UploadOutlined />,
            onClick: handleMenuClick,
        },
    ];

    if (hasNotes) {
        items.push({
            key: "2",
            label: "Resumir Notas",
            icon: <MergeCellsOutlined />,
            onClick: handleMenuClick,
        });
    }

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
                        <Dropdown 
                            menu={{ items }} 
                            trigger={["click"]} 
                            onOpenChange={(open) => setDropdownOpen(open)}
                        >
                            <Button type="primary">
                                <DownOutlined
                                    className={css`
                                        transition: transform 0.3s ease;
                                        transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                                    `}
                                />
                                Seleccionar Opción{" "}
                            </Button>
                        </Dropdown>
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

            <Modal
                title="Importar desde Word"
                open={modalImportWord}
                onCancel={() => setModalImportWord(false)}
                footer={null}
                centered
                width={500}
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ marginBottom: '20px' }}>
                        Selecciona un documento de Word (.docx o .doc) que tenga el mismo formato que los documentos exportados.
                    </p>
                    <Upload.Dragger
                        name="file"
                        multiple={false}
                        beforeUpload={handleFileUpload}
                        accept=".docx,.doc"
                        disabled={importLoading}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Haz clic o arrastra el archivo aquí para subirlo
                        </p>
                        <p className="ant-upload-hint">
                            Solo archivos .docx y .doc
                        </p>
                    </Upload.Dragger>
                    {importLoading && (
                        <div style={{ marginTop: '20px' }}>
                            <p>Procesando documento...</p>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                title={`Preview de Importación - ${previewContents.length} contenidos encontrados`}
                open={modalPreviewImport}
                onCancel={() => {
                    setModalPreviewImport(false);
                    setPreviewContents([]);
                    setImportedFile(null);
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setModalPreviewImport(false);
                        setPreviewContents([]);
                        setImportedFile(null);
                    }}>
                        Cancelar
                    </Button>,
                    <Button 
                        key="confirm" 
                        type="primary" 
                        loading={importLoading}
                        onClick={confirmImport}
                        disabled={previewContents.length === 0}
                    >
                        Confirmar Importación ({previewContents.length} contenidos)
                    </Button>
                ]}
                centered
                width={900}
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div style={{ 
                        marginBottom: '20px', 
                        padding: '12px', 
                        backgroundColor: '#f0f8ff', 
                        borderRadius: '6px',
                        border: '1px solid #d6e4ff'
                    }}>
                        <p style={{ margin: 0, color: '#1890ff', fontWeight: 500 }}>
                            📄 Archivo: {importedFile?.name}
                        </p>
                        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                            Revisa cómo quedarían los contenidos después de la importación. 
                            Los contenidos existentes se actualizarán con la información del documento.
                        </p>
                    </div>
                    
                    {previewContents.map((content, index) => (
                        <Card 
                            key={index} 
                            size="small" 
                            style={{ marginBottom: '16px' }}
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Contenido {index + 1}</span>
                                    <span style={{ 
                                        padding: '2px 8px', 
                                        borderRadius: '12px', 
                                        fontSize: '12px',
                                        backgroundColor: content.type === 'Nota' ? '#e6f7ff' : '#fff7e6',
                                        color: content.type === 'Nota' ? '#1890ff' : '#fa8c16',
                                        border: `1px solid ${content.type === 'Nota' ? '#91d5ff' : '#ffd591'}`
                                    }}>
                                        {content.type}
                                    </span>
                                </div>
                            }
                        >
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#1890ff' }}>Título:</strong>
                                <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                                    {content.title}
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#1890ff' }}>Encabezado:</strong>
                                <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                                    {content.head}
                                </div>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#1890ff' }}>Dependencia:</strong> {content.dependence}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#1890ff' }}>Clasificación:</strong> {content.classification}
                            </div>
                            <div>
                                <strong style={{ color: '#1890ff' }}>Contenido:</strong>
                                <div 
                                    style={{ 
                                        marginTop: '8px', 
                                        padding: '12px', 
                                        backgroundColor: '#f5f5f5', 
                                        borderRadius: '6px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {content.textContent}
                                </div>
                            </div>
                        </Card>
                    ))}
                    
                    {previewContents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No se encontraron contenidos</p>
                            <p style={{ fontSize: '14px', color: '#999' }}>
                                El documento no contiene contenidos en el formato esperado (1.- Título).
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </Row>
    );
};

export default DailySummaryDetails; 