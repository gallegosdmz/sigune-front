import Table, { ColumnsType } from "antd/es/table";
import { Content } from "../../interfaces/Content";
import { EyeOutlined, LeftOutlined } from "@ant-design/icons";
import { User } from "../../interfaces/User";
import { Button, Card, Input as SearchInput } from "antd";
import * as ContentUtils from '../../utils/ContentUtils';
import { useEffect, useState } from "react";
import EditContent from "./EditContent";
import { useParams } from "react-router-dom";


type Props = {
    setShowListExternal: ( showListExternal: boolean ) => void,
    setVisibleViewNote: ( visibleViewNote: boolean ) => void,
    setVisibleViewSection: ( visibleViewSection: boolean ) => void,
    setFile: ( file: any ) => void,
    file: any | null,
    visibleViewNote: boolean,
    visibleViewSection: boolean
}

const { Search } = SearchInput;

const ListExternalContents: React.FC<Props> = ({ setShowListExternal, setFile, file }) => {
    const [contents, setContents] = useState<Content[]>([]);
    const [content, setContent] = useState<Content | null>(null);

    const [visibleViewNote, setVisibleViewNote] = useState<boolean>(false);
    const [visibleViewSection, setVisibleViewSection] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState('');

    const { idScript } = useParams<{ idScript: string }>();

    useEffect(() => {
        ContentUtils.handleSetContentsWithScriptDisapproved( setContents );
    }, []);

    const filteredContents = contents.filter(
        (content) =>
            content.title.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const columns: ColumnsType<Content> = [
        {
            title: "Titulo",
            dataIndex: "title",
            key: "title",
            render: (_, record) => `${record.type} - ${record.title}`,
        },
        {
            title: "Usuario",
            dataIndex: "user",
            key: "user",
            render: (record: User) => `${record.name} ${record.surname}`,
        },
        {
            title: "Fecha de Creado",
            dataIndex: "createdAt",
            key: "createdAt",
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
            title: "Acciones",
            key: "actions",
            render: (_, record: Content) => (
            <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => ContentUtils.handleModalView( record, setContent, setFile ,record.type === 'Nota' ? setVisibleViewNote : setVisibleViewSection )}
            >
                Ver
            </Button>
            ),
        },
    ];

    return (
        

        <>

        <Card 
          title="Lista de Contenidos Externos"
          extra={
            <Button type="primary" icon={<LeftOutlined />} onClick={ () => setShowListExternal( false ) }>
              Regresar
            </Button>
          }
        >
            <Search
                placeholder="Buscar Departamento"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredContents } rowKey="id" />
        </Card>
        <EditContent
          content={content}
          script={Number( idScript )} // cambiarlo por idScript
          file={file}
          setContents={setContents}
          setVisibleViewNote={setVisibleViewNote}
          setVisibleViewSection={setVisibleViewSection}
          visibleViewNote={visibleViewNote}
          visibleViewSection={visibleViewSection}
        />
        </>
    );
}

export default ListExternalContents;