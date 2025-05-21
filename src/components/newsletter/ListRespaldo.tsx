import { Button, Card, Dropdown, MenuProps, message, Input as SearchInput, Space, Table } from "antd";
import { NewsLetter } from "../../interfaces/NewsLetter";
import { useEffect, useState } from "react";
import { DatabaseOutlined, DownOutlined } from "@ant-design/icons";
import * as NewsLetterUtils from '../../utils/NewsLetterUtils'
import { css } from "@emotion/css";
import ListNewsLetter from "./ListNewsLetter";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header, TableRow, TableCell, Table as TableWORD } from "docx"
import { saveAs } from "file-saver"
import { Content } from "../../interfaces/Content";


const { Search } = SearchInput;

const ListRespaldo: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newsLetters, setNewsLetters] = useState<Content[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [period, setPeriod] = useState<number | null>(null);
    const [newsLetter, setNewsLetter] = useState<NewsLetter | null>(null)
    const [modalView, setModalView] = useState<boolean>(false)

    useEffect(() => {
        if (period === null) return;

        NewsLetterUtils.handleSetNewsLettersForPeriod(period!, setNewsLetters);
    }, [period]);

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "1er Trimestre",
            onClick: () => setPeriod(1)
        },
        {
            key: "2",
            label: "2do Trimestre",
            onClick: () => setPeriod(2)
        },
        {
            key: "3",
            label: "3er Trimestre",
            onClick: () => setPeriod(3)
        },
        {
            key: "4",
            label: "4to Trimestre",
            onClick: () => setPeriod(4)
        },
    ];


    const filteredNewsLetters = newsLetters.filter(
        (newsLetter) =>
            newsLetter.dependence.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const columns = [
        {
            title: 'Mes',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => {
                const date = new Date(createdAt);
                const meses = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const mes = meses[date.getMonth()];
                return `${mes}`;
            }
        },
        {
            title: 'Dependencia',
            dataIndex: 'dependence',
            key: 'dependence'
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: (record: NewsLetter) => (
                <Space className="flex" size="middle">
                    <Button
                        icon={<DatabaseOutlined className="text-green-700" />}
                        onClick={() => NewsLetterUtils.handleModalView(record, setNewsLetter, setModalView)}
                    />
                </Space>
            )
        }
    ];

    const getLogoBuffer = async () => {
        const response = await fetch(
            "https://res.cloudinary.com/gallegos-dev/image/upload/v1746470082/Logo_Actualizado_010425_rx8gyh.png",
        )
        const blob = await response.blob()
        return await blob.arrayBuffer()
    }


    const exportToWord = async () => {
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
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        });

        const title = new Paragraph({
            children: [
                new TextRun({
                    text: "RESPALDO INFORMATIVO",
                    bold: true,
                    size: 28,
                    font: "Arial",
                    color: "000000", // negro
                }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        });

        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const tableRows = [
            // Header row
            new TableRow({
                children: ["Mes", "Dependencia", "Nombre"].map((text) =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text,
                                        bold: true,
                                        font: "Arial",
                                        size: 26,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                        verticalAlign: "center",
                    })
                ),
            }),
            // Data rows
            ...newsLetters.map((item) => {
                const date = new Date(item.createdAt!);
                const mes = meses[date.getMonth()];
                return new TableRow({
                    children: [
                        mes,
                        item.dependence,
                        item.title,
                    ].map((text) =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text,
                                            font: "Arial",
                                            size: 24,
                                        }),
                                    ],
                                }),
                            ],
                        })
                    ),
                });
            }),
        ];

        const table = new TableWORD({
            rows: tableRows,
            width: {
                size: 100,
                type: "pct",
            },
        });

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
            title: "Respaldo Informativo",
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: "landscape",
                            },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [imageParagraph],
                        }),
                    },
                    children: [title, table, signatureLine, signatureName, signaturePosition],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "RESPALDO_INFORMATIVO.docx");
        message.success(`Exportados ${newsLetters.length} elementos.`);
    };


    const handleExport = async () => {
        exportToWord();

        message.success(`Exportados ${newsLetters.length} elementos.`);
    };

    return (
        <>
            {localStorage.getItem('typeUser') === 'admin_user' ? (
                <Card
                    title="Respaldo Informativo"
                    extra={
                        <Dropdown
                            menu={{ items }}
                            trigger={["click"]}
                            onOpenChange={(open) => setDropdownOpen(open)}
                        >
                            {period === null ? (
                                <Button
                                    type="primary"
                                >
                                    <DownOutlined
                                        className={css`
                                    transition: transform 0.3s ease;
                                    transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                                `}
                                    />
                                    Seleccionar Periodo{" "}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={handleExport}
                                >
                                    Exportar
                                </Button>
                            )}
                        </Dropdown>
                    }
                >
                    <Search
                        placeholder="Buscar Boletín por Clasificación"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Table columns={columns} dataSource={filteredNewsLetters} rowKey="id" />
                </Card>
            ) : (
                <Card
                    title="Respaldo Informativo"
                >
                    <Search
                        placeholder="Buscar Boletín por Clasificación"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Table columns={columns} dataSource={filteredNewsLetters} rowKey="id" />
                </Card>
            )}

            <ListNewsLetter
                newsLetter={newsLetter}
                modalView={modalView}
                setModalView={setModalView}
            />
        </>
    );
}

export default ListRespaldo;