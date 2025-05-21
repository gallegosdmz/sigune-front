import { DatabaseOutlined, DownOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { Button, Card, Dropdown, MenuProps, message, Space, Table } from "antd";
import { useState } from "react";
import { getReport } from "../../services/ApiCalls";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header, TableRow, TableCell, Table as TableWORD } from "docx"
import { saveAs } from "file-saver"

(pdfMake as any).vfs = pdfFonts.vfs;

const ListReportsMensual: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [period, setPeriod] = useState<number | null>(null);

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "2025",
            onClick: () => setPeriod(2025)
        }
    ];

    const handleReport = async (period: number | null, id: number) => {
        if (!period) return;

        let startDate: Date;
        let endDate: Date;

        switch (id) {
            case 1:
                startDate = new Date(`${period}-01-01`);
                endDate = new Date(`${period}-01-31`);
                break;
            case 2:
                startDate = new Date(`${period}-02-01`);
                endDate = new Date(`${period}-02-28`);
                break;
            case 3:
                startDate = new Date(`${period}-03-01`);
                endDate = new Date(`${period}-03-31`);
                break;
            case 4:
                startDate = new Date(`${period}-04-01`);
                endDate = new Date(`${period}-04-30`);
                break;
            case 5:
                startDate = new Date(`${period}-05-01`);
                endDate = new Date(`${period}-05-31`);
                break;
            case 6:
                startDate = new Date(`${period}-06-01`);
                endDate = new Date(`${period}-06-30`);
                break;
            case 7:
                startDate = new Date(`${period}-07-01`);
                endDate = new Date(`${period}-07-31`);
                break;
            case 8:
                startDate = new Date(`${period}-08-01`);
                endDate = new Date(`${period}-08-31`);
                break;
            case 9:
                startDate = new Date(`${period}-09-01`);
                endDate = new Date(`${period}-09-30`);
                break;
            case 10:
                startDate = new Date(`${period}-10-01`);
                endDate = new Date(`${period}-10-31`);
                break;
            case 11:
                startDate = new Date(`${period}-11-01`);
                endDate = new Date(`${period}-11-30`);
                break;
            case 12:
                startDate = new Date(`${period}-12-01`);
                endDate = new Date(`${period}-12-31`);
                break;
            default:
                throw new Error("ID de trimestre no válido.");
        }

        const report = await getReport(startDate, endDate);
        console.log(report);

        exportToWord(report);
    };

    const getDateMx = () => {
        const date = new Date();
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const dia = date.getDate();
        const mes = meses[date.getMonth()];
        const año = date.getFullYear();
        return `${dia} de ${mes} del ${año}`;
    }

    const getLogoBuffer = async () => {
        const response = await fetch(
            "https://res.cloudinary.com/gallegos-dev/image/upload/v1746470082/Logo_Actualizado_010425_rx8gyh.png",
        )
        const blob = await response.blob()
        return await blob.arrayBuffer()
    }

    const exportToWord = async (report: {
        total: number;
        propios: number;
        coproducidos: number;
        byDependence: any[];
        byClassification: any[];
    }) => {

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
                    color: "000000",
                }),
                new TextRun({
                    text: getDateMx().toUpperCase(),
                    break: 1,
                    bold: true,
                    size: 26,
                    font: "Arial",
                    color: "000000",
                }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        });

        const buildCellContent = (items: any[] | number | undefined | null) => {
            if (typeof items === "number") {
                return [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: items.toString(),
                                font: "Arial",
                                size: 28,      // tamaño más grande
                                bold: true,    // negrita
                            }),
                        ],
                        alignment: AlignmentType.CENTER,  // centrar texto
                        spacing: { after: 100 },
                    }),
                ];
            }

            if (!Array.isArray(items) || items.length === 0) {
                return [
                    new Paragraph({
                        text: "",
                        alignment: AlignmentType.CENTER,
                    }),
                ];
            }

            return items.map(item => {
                return new Paragraph({
                    children: [
                        new TextRun({
                            text: item,
                            font: "Arial",
                            size: 28,      // tamaño más grande
                            bold: true,    // negrita
                        }),
                    ],
                    alignment: AlignmentType.CENTER,  // centrar texto
                    spacing: { after: 100 },
                });
            });
        };

        const table = new TableWORD({
            width: { size: 100, type: "pct" },
            rows: [
                new TableRow({
                    children: ["Contenidos Propios", "Contenidos Coproducidos", "Contenidos Externos"].map(text =>
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
                new TableRow({
                    children: [report.propios, report.coproducidos, []].map(items =>
                        new TableCell({
                            children: buildCellContent(items),
                        })
                    ),
                }),
            ],
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
            title: "Reporte Mensual",
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
        saveAs(blob, "REPORTE_MENSUAL.docx");
        message.success(`Exportados ${report.propios + report.coproducidos} elementos.`);
    };


    const columns = [
        {
            title: 'Periodo',
            dataIndex: 'period',
            key: 'period'
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: (record: any) => (
                <Space className="flex" size="middle">
                    <Button
                        icon={<DatabaseOutlined className="text-green-700" />}
                        onClick={() => handleReport(period, record.id)}
                    />
                </Space>
            )
        }
    ];

    const dataSource = [
        {
            id: 1,
            period: 'Enero'
        },
        {
            id: 2,
            period: 'Febrero'
        },
        {
            id: 3,
            period: 'Marzo'
        },
        {
            id: 4,
            period: 'Abril'
        },
        {
            id: 5,
            period: 'Mayo'
        },
        {
            id: 6,
            period: 'Junio'
        },
        {
            id: 7,
            period: 'Julio'
        },
        {
            id: 8,
            period: 'Agosto'
        },
        {
            id: 9,
            period: 'Septiembre'
        },
        {
            id: 10,
            period: 'Octubre'
        },
        {
            id: 11,
            period: 'Noviembre'
        },
        {
            id: 12,
            period: 'Diciembre'
        },
    ];


    return (
        <Card
            title="Lista de Meses"
            extra={
                <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    onOpenChange={(open) => setDropdownOpen(open)}
                >
                    {localStorage.getItem('typeUser') === 'admin_user' ? (
                        <Button
                            type="primary"
                        >
                            <DownOutlined
                                className={css`
                    transition: transform 0.3s ease;
                    transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                  `}
                            />
                            Seleccionar Año{" "}
                        </Button>
                    ) : (
                        <></>
                    )}
                </Dropdown>
            }
        >
            {period !== null ? (
                <Table columns={columns} dataSource={dataSource} rowKey="id" />
            ) : (
                <></>
            )}
        </Card>
    );
}

export default ListReportsMensual;