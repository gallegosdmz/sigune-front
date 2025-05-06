import { DatabaseOutlined, DownOutlined } from "@ant-design/icons";
import { css } from "@emotion/css";
import { Button, Card, Dropdown, MenuProps, Space, Table } from "antd";
import { useState } from "react";
import { getReport } from "../../services/ApiCalls";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

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

    const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

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
    
        const report = await getReport(startDate, endDate);
        const logoBase64 = await getBase64ImageFromUrl("https://res.cloudinary.com/gallegos-dev/image/upload/v1746470082/Logo_Actualizado_010425_rx8gyh.png");

        generateReportPDF(report, logoBase64);
    };

    const generateReportPDF = (
        report: { total: number; byDependence: any[]; byClassification: any[] },
        logoBase64: string
    ) => {
        const { total, byDependence, byClassification } = report;
    
        const docDefinition: any = {
            content: [
                { image: 'logo', width: 500, alignment: 'center', margin: [0, 0, 0, 10] },
                { text: 'Reporte de Contenidos', style: 'header' },
                { text: `Total de contenidos: ${total}`, style: 'subheader' },
    
                { text: 'Por Dependencia:', style: 'sectionHeader' },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            ['Dependencia', 'Total'],
                            ...byDependence.map((item: any) => [item.dependence, item.count])
                        ]
                    }
                },
    
                { text: 'Por Clasificación:', style: 'sectionHeader', margin: [0, 20, 0, 5] },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            ['Clasificación', 'Total'],
                            ...byClassification.map((item: any) => [item.classification, item.count])
                        ]
                    }
                }
            ],
            images: {
                logo: logoBase64
            },
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 14,
                    margin: [0, 0, 0, 10]
                },
                sectionHeader: {
                    fontSize: 13,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            }
        };
    
        pdfMake.createPdf(docDefinition).download("reporte-contenidos.pdf");
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
                        icon={<DatabaseOutlined className="text-green-700"/>}
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
                <Table columns={ columns } dataSource={dataSource} rowKey="id" />
            ) : (
                <></>
            )}
        </Card>
    );
}

export default ListReports;