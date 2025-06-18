import { Button, Card, Col, Dropdown, MenuProps, Row, Input as SearchInput } from 'antd';
import { Content } from "../../interfaces/Content"
import { useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { DownOutlined, EyeOutlined } from '@ant-design/icons';
import * as ContentUtils from '../../utils/ContentUtils';
import { css } from '@emotion/css';
import { useNavigate } from 'react-router-dom'; // ✅ Importación agregada

const { Search } = SearchInput;

type Props = {
    contents: Content[],
    setContent: ( content: Content ) => void,
    dropdownOpen: boolean,
    setDropdownOpen: (dropdownOpen: boolean) => void,
    setVisibleAddNote: (visibleAddNote: boolean) => void,
    setVisibleViewNote: (visibleViewNote: boolean) => void,
    setVisibleViewSection: (visibleViewSection: boolean) => void,
    setModalResumen: (modalResumen: boolean) => void,
    setModalBitacora: (modalBitacora: boolean) => void,
    setFile: (file: any | null) => void,
}

const ListContents: React.FC<Props> = ({
    contents,
    setContent,
    dropdownOpen,
    setDropdownOpen,
    setVisibleAddNote,
    setVisibleViewNote,
    setVisibleViewSection,
    setModalResumen,
    setModalBitacora,
    setFile
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); 

    const filteredContents = contents.filter(
        (content) =>
            content.title.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const columns: ColumnsType<Content> = [
        {
            title: 'Titulo',
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => `${record.title}`
        },
        {
            title: 'Fecha de Creado',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) =>
                record.createdAt
                    ? new Date(record.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                    : "Fecha no disponible",
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => record.status ? <p className='text-green-400'>Aprobado</p> : <p className='text-red-400'>Sin Aprobar</p>
        },
        {
            title: "Acciones",
            key: "actions",
            render: (_, record: Content) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => ContentUtils.handleModalView(record, setContent, setFile, record.type === 'Nota' ? setVisibleViewNote : setVisibleViewSection)}
                >
                    Ver
                </Button>
            ),
        },
    ];

    const handleMenuClick = (e: { key: string }) => {
        switch (e.key) {
            case "1":
                setVisibleAddNote(true);
                break;
            case "2":
                setModalResumen(true);
                break;
            case "3":
                setModalBitacora(true);
                break;
            case "4":
                navigate("/resumenes-semanales"); 
                break;
        }
    };

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "Agregar Nota",
            onClick: handleMenuClick,
        },
        {
            key: "2",
            label: "Generar Resumen",
            onClick: handleMenuClick,
        },
        {
            key: "3",
            label: "Generar Bitacora",
            onClick: handleMenuClick,
        },
        {
            key: "4",
            label: "Ver Resúmenes Semanales",
            onClick: handleMenuClick,
        },
    ];

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
                <Card
                    title="Lista de Contenidos"
                    extra={
                        <Dropdown menu={{ items }} trigger={["click"]} onOpenChange={(open) => setDropdownOpen(open)}>
                            <Button type="primary">
                                <DownOutlined
                                    className={css`
                                        transition: transform 0.3s ease;
                                        transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                                    `}
                                />
                                Seleccionar Opciones{" "}
                            </Button>
                        </Dropdown>
                    }
                >
                    <Search
                        placeholder="Buscar Contenido"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <Table columns={columns} dataSource={filteredContents} rowKey="id" />
                </Card>
            </Col>
        </Row>
    );
};

export default ListContents;
