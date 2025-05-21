import { DatabaseOutlined, DownOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { Button, Card, Dropdown, MenuProps, message, Space, Table } from "antd";
import { useState } from "react";
import { getReport } from "../../services/ApiCalls";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header, TableRow, TableCell, Table as TableWORD, WidthType, VerticalAlign } from "docx"
import { saveAs } from "file-saver"
import { Content } from "pdfmake/interfaces";

(pdfMake as any).vfs = pdfFonts.vfs;

const ListReports: React.FC = () => {
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
                endDate = new Date(`${period}-03-31`);
                break;
            case 2:
                startDate = new Date(`${period}-04-01`);
                endDate = new Date(`${period}-06-30`);
                break;
            case 3:
                startDate = new Date(`${period}-07-01`);
                endDate = new Date(`${period}-09-30`);
                break;
            case 4:
                startDate = new Date(`${period}-10-01`);
                endDate = new Date(`${period}-12-31`);
                break;
            default:
                throw new Error("ID de trimestre no válido.");
        }

        console.log(startDate);
        console.log(endDate);

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

    type CoProducidos = {
        contents: Content[],
        count: number,
    }

    type Producidos = {
        contents: Content[],
        count: number,
    }

    const exportToWord = async (report: {
        byClassification: any[];
        byDependence: any[];
        coproducidos: CoProducidos;
        propios: Producidos;
        months: { month: string; count: number }[];
        total: number;
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
                    text: "CONTEO DE CONTENIDO DE NOTICIAS",
                    bold: true,
                    size: 28,
                    font: "Arial",
                    color: "000000",
                }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        });

        // Cabecera de la tabla
        const tableHeader = new TableRow({
            children: ["MES", "CONTENIDOS TRANSMITIDOS"].map(text =>
                new TableCell({
                    shading: {
                        fill: "D99594", // <- Color hexadecimal sin el símbolo #
                    },
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
        });

        // Filas de la tabla con los datos de los meses
        const monthRows = report.months.map(({ month, count }) =>
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: month,
                                        font: "Arial",
                                        size: 26,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                        verticalAlign: "center",
                    }),
                    new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: count.toString(),
                                        font: "Arial",
                                        size: 26,
                                        bold: true,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                        verticalAlign: "center",
                    }),
                ],
            })
        );

        const totalRow = new TableRow({
            children: [
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: {
                        fill: "f2dbdb", // gris claro para distinguir el total
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "TOTAL",
                                    bold: true,
                                    font: "Arial",
                                    size: 26,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                }),
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: {
                        fill: "f2dbdb",
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: report.total.toString(),
                                    bold: true,
                                    font: "Arial",
                                    size: 26,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                }),
            ],
        })


        const firstTable = new TableWORD({
            width: { size: 60, type: "pct" },
            alignment: AlignmentType.CENTER, // centrada
            rows: [tableHeader, ...monthRows, totalRow],
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
            title: "Reporte Trimestral",
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
                    children: [title, firstTable, signatureLine, signatureName, signaturePosition],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "REPORTE_TRIMESTRAL.docx");
        message.success(`Exportados ${report.propios.count + report.coproducidos.count} elementos.`);
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
            period: 'Primer Trimestre'
        },
        {
            id: 2,
            period: 'Segundo Trimestre'
        },
        {
            id: 3,
            period: 'Tercer Trimestre'
        },
        {
            id: 4,
            period: 'Cuarto Trimestre'
        },
    ];


    return (
        <Card
            title="Lista de Periodos"
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
                // HACER VISTA PARA GENERAR REPORTES MENSUALES

            )}
        </Card>
    );
}

export default ListReports;