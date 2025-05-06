import { Button, Card, Input as SearchInput, FormInstance, Table, Space } from "antd"
import { Script } from "../../interfaces/Script"
import { useState } from "react"
import { DatabaseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import * as ScriptUtils from '../../utils/ScriptUtils';
import { useNavigate } from "react-router-dom";

type Props = {
    scripts: Script[],
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    setScript: ( script: Script ) => void,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    editForm: FormInstance
}

const { Search } = SearchInput;

const ListScripts: React.FC<Props> = ({ scripts, setVisibleAdd, setVisibleEdit, setScript, setScripts, editForm }) => {
    // STATES
    const [ searchTerm, setSearchTerm ] = useState('');

    const navigate = useNavigate();

    // FILTERS
    const filteredScripts = scripts.filter(
        ( script ) =>
            script.title.toUpperCase().includes( searchTerm.toUpperCase() )
    );

    const columns = [
        {
            title: 'Titulo',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Fecha de Emisión',
            dataIndex: 'dateEmission',
            key: 'dateEmission',
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: ( record: Script ) => (
              <Space className="flex" size="middle">
                <Button
                  icon={<DatabaseOutlined className="text-green-700" />}
                  onClick={() => navigate(`/panel-guion/${record.id}`)}
                />
                {localStorage.getItem('typeUser') === 'admin_user' ? (
                  <>
                    <Button
                    icon={<EditOutlined className="text-blue-700" />}
                    onClick={() => ScriptUtils.handleEdit(
                      record,
                      setScript,
                      editForm,
                      setVisibleEdit
                    )}
                    />

                    <Button
                    icon={<DeleteOutlined className="text-red-700" />}
                    onClick={() =>
                      ScriptUtils.handleDelete(
                        record,
                        setScripts
                      )}
                    />  
                  </>
                ) : (
                  <></>
                )}
                
              </Space>
            )
          }
    ];

    return (
        <Card 
          title="Lista de Guiones"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAdd( true ) }>
              Agregar Guión
            </Button>
          }
        >
            <Search
                placeholder="Buscar Guión"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredScripts } rowKey="id" />
        </Card>
    );
}

export default ListScripts;