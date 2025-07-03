import { Button, Card, Col, Row, Input as SearchInput } from 'antd';
import { Content } from "../../interfaces/Content"
import { useEffect, useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import * as ContentUtils from '../../utils/ContentUtils';
import CreateContent from './CreateContent';
import EditContent from './EditContent';


const { Search } = SearchInput;

const ListContents: React.FC = () => {
    // STATES
    const [searchTerm, setSearchTerm] = useState('');
    const [contents, setContents] = useState<Content[]>([]);
    const [content, setContent] = useState<Content | null>(null);
    const [file, setFile] = useState<any | null>(null);

    const [visibleAddNote, setVisibleAddNote] = useState<boolean>(false);
    const [visibleViewNote, setVisibleViewNote] = useState<boolean>(false);
    const [visibleAddSection, setVisibleAddSection] = useState<boolean>(false);
    const [visibleViewSection, setVisibleViewSection] = useState<boolean>(false);
    const [visibleAddAdvance, setVisibleAddAdvance] = useState<boolean>(false);

    useEffect(() => {
        ContentUtils.handleSetContentsForUser( setContents );
    }, []);
    
    // FILTERS
    const filteredContents = contents.filter(
        ( content ) =>
            content.title.toUpperCase().includes( searchTerm.toUpperCase() )
    );

    const columns: ColumnsType<Content> = [
        {
            title: 'Titulo',
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => `${ record.title }`
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
                 onClick={() => ContentUtils.handleModalView( record, setContent, setFile, record.type === 'Nota' ? setVisibleViewNote : setVisibleViewSection )}
                >
                 Ver
                </Button>
            ),
        },
    ];

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card 
                title="Lista de Contenidos"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAddNote( true ) }>
                        Agregar Contenido
                    </Button>
                }
            >
                <Search
                    placeholder="Buscar Contenido"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Table columns={ columns } dataSource={ filteredContents } rowKey="id" />
            </Card>
           <CreateContent
                script={null}
                setContents={setContents}
                setVisibleAddNote={setVisibleAddNote}
                setVisibleAddSection={setVisibleAddSection}
                setVisibleAddAdvance={setVisibleAddAdvance}
                visibleAddNote={visibleAddNote}
                visibleAddSection={visibleAddSection}
                visibleAddAdvance={visibleAddAdvance}
           />

            <EditContent
                content={content}
                script={null}
                file={file}
                setFile={setFile}
                setContents={setContents}
                setVisibleViewNote={setVisibleViewNote}
                setVisibleViewSection={setVisibleViewSection}
                visibleViewNote={visibleViewNote}
                visibleViewSection={visibleViewSection}
            />
          </Col>
        </Row>
        
    );
}

export default ListContents;