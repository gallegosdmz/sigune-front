import { Button, Card, Dropdown, MenuProps, message, Input as SearchInput, Space, Table } from "antd";
import { NewsLetter } from "../../interfaces/NewsLetter";
import { useEffect, useState } from "react";
import { DatabaseOutlined, DownOutlined } from "@ant-design/icons";
import * as NewsLetterUtils from '../../utils/NewsLetterUtils'
import { css } from "@emotion/css";
import ListNewsLetter from "./ListNewsLetter";
import { saveAs } from "file-saver"
import { Content } from "../../interfaces/Content";
import ExcelJS from "exceljs";


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


    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Respaldo Informativo");

        // Establecer configuración de página para impresión
        worksheet.pageSetup = {
            orientation: "landscape",
            horizontalCentered: true,
            verticalCentered: false,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.5,
                right: 0.5,
                top: 0.75,
                bottom: 0.75,
                header: 0.3,
                footer: 0.3,
            },
        };

        // Insertar imagen del logo
        const logoBuffer = await getLogoBuffer(); // Función que devuelve el buffer de tu imagen
        const imageId = workbook.addImage({
            buffer: logoBuffer,
            extension: "png",
        });

        worksheet.mergeCells("A1:D3"); // Combina A1 a D3 para reservar espacio del logo
        worksheet.addImage(imageId, {
            tl: { col: 2, row: 0 },   // posición inicial (columna A, fila 1)
            ext: { width: 500, height: 60 }, // dimensiones del logo
            editAs: "oneCell", // evita el error de tipo
        });

        // Fila vacía después del logo
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Título
        const titleRow = worksheet.addRow(["RESPALDO INFORMATIVO"]);
        titleRow.height = 30;
        titleRow.font = { bold: true, size: 16, name: "Arial" };
        worksheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
        titleRow.alignment = { horizontal: "center", vertical: "middle" };

        worksheet.addRow([]);

        // Encabezados de la tabla
        const headerRow = worksheet.addRow(["Mes", "Día", "Dependencia", "Nombre"]);
        headerRow.font = { bold: true, size: 13, name: "Arial" };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Contenido de la tabla
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
        ];

        newsLetters.forEach((item) => {
            const date = new Date(item.createdAt!);
            const mes = meses[date.getMonth()];

            const dia = date.getDate();
            const row = worksheet.addRow([mes, dia, item.dependence, item.title]);
            row.font = { size: 12, name: "Arial" };
            row.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        worksheet.columns = [
            { key: "mes", width: 10 },
            { key: "dia", width: 20 },
            { key: "dependencia", width: 40 },
            { key: "nombre", width: 60 },
        ];


        // Espacio antes de la firma
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Línea de firma centrada
        const firmaRow1 = worksheet.addRow(["_____________________________________"]);
        worksheet.mergeCells(`A${firmaRow1.number}:D${firmaRow1.number}`);
        firmaRow1.getCell(1).alignment = { horizontal: "center" };

        // Nombre centrado
        const firmaRow2 = worksheet.addRow(["Lic. Martha Gabriela Yeverino Sifuentes"]);
        worksheet.mergeCells(`A${firmaRow2.number}:D${firmaRow2.number}`);
        firmaRow2.getCell(1).font = { name: "Arial", size: 12 };
        firmaRow2.getCell(1).alignment = { horizontal: "center" };

        // Cargo centrado
        const firmaRow3 = worksheet.addRow(["Jefa del Departamento de Noticias"]);
        worksheet.mergeCells(`A${firmaRow3.number}:D${firmaRow3.number}`);
        firmaRow3.getCell(1).font = { name: "Arial", size: 12 };
        firmaRow3.getCell(1).alignment = { horizontal: "center" };


        // Ajustar altura de todas las filas
        worksheet.eachRow({ includeEmpty: true }, (row) => {
            row.height = 20;
        });

        // Repetir encabezados en cada página
        const headerRowNumber = headerRow.number;
        worksheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
        worksheet.pageSetup.printTitlesRow = `${headerRowNumber}:${headerRowNumber}`;

        // Guardar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "RESPALDO_INFORMATIVO.xlsx");
    };


    const handleExport = async () => {
        exportToExcel();

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