import { Button, Card, FormInstance, Input as SearchInput, Space, Table } from "antd";
import { NewsLetter } from "../../interfaces/NewsLetter";
import { useState } from "react";
import { DatabaseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import * as NewsLetterUtils from '../../utils/NewsLetterUtils'

type Props = {
    newsLetters: NewsLetter[],
    setVisibleAdd: (visibleAdd: boolean) => void,
    setVisibleEdit: (visibleEdit: boolean) => void,
    setNewsLetter: (newsLetter: NewsLetter ) => void,
    setNewsLetters: (newsLetters: (prevNewsLetters: NewsLetter[]) => NewsLetter[]) => void,
    setModalView: (modalView: boolean) => void,
    editForm: FormInstance
}

const {Search} = SearchInput;

const ListNewLetters: React.FC<Props> = ({
    newsLetters,
    setVisibleAdd,
    setVisibleEdit,
    setNewsLetter,
    setNewsLetters,
    setModalView,
    editForm
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNewsLetters = newsLetters.filter(
        (newsLetter) =>
            newsLetter.dependence.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const columns = [
        {
            title: 'Fecha de Enviado',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => {
                const date = new Date(createdAt);
                const meses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];
                const dia = date.getDate();
                const mes = meses[date.getMonth()];
                const año = date.getFullYear();
                return `${dia} de ${mes} del ${año}`;
            }
        },
        {
            title: 'Dependencia',
            dataIndex: 'dependence',
            key: 'dependence'
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: (record: NewsLetter) => (
                <Space className="flex" size="middle">
                    <Button
                        icon={<DatabaseOutlined className="text-green-700"/>}
                        onClick={() => NewsLetterUtils.handleModalView(record, setNewsLetter, setModalView)}
                    />
                    <Button
                        icon={<EditOutlined className="text-blue-700"/>}
                        onClick={() => NewsLetterUtils.handleEdit(record, setNewsLetter, editForm, setVisibleEdit)}
                    />
                    <Button
                        icon={<DeleteOutlined className="text-red-700"/>}
                        onClick={() => NewsLetterUtils.handleDelete(record, setNewsLetters)}
                    />
                </Space>
            )
        }
    ];

    return (
        <Card 
          title="Lista de Boletines"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAdd( true ) }>
              Agregar Boletín
            </Button>
          }
        >
            <Search
                placeholder="Buscar Boletín por Clasificación"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredNewsLetters } rowKey="id" />
        </Card>
    );
}

export default ListNewLetters;