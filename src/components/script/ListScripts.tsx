import { Button, Card, Input as SearchInput, FormInstance, Table, Space, MenuProps, Dropdown } from "antd"
import { Script } from "../../interfaces/Script"
import { useState } from "react"
import { DatabaseOutlined, DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons"
import * as ScriptUtils from '../../utils/ScriptUtils';
import { useNavigate } from "react-router-dom";
import { css } from "@emotion/css";
import ListResumenSemanal from "./ListResumenSemanal";

type Props = {
    scripts: Script[],
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    setScript: ( script: Script ) => void,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    setModalResumen: (modalResumen: boolean) => void,
    modalResumen: boolean,
    editForm: FormInstance
}

const { Search } = SearchInput;

const ListScripts: React.FC<Props> = ({ scripts, setVisibleAdd, setVisibleEdit, setScript, setScripts, setModalResumen, modalResumen, editForm }) => {
    // STATES
    const [ searchTerm, setSearchTerm ] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false)
    
    const navigate = useNavigate();

    // FILTERS
    const filteredScripts = scripts.filter(
        ( script ) =>
            script.title.toUpperCase().includes( searchTerm.toUpperCase() )
    );

    const handleMenuClick = (e: { key: string }) => {
      if (e.key === "1") {
        setVisibleAdd(true)
      } else if (e.key === "2") {
        setModalResumen(true)
      }
    }

    const items: MenuProps["items"] = [
      {
        key: "1",
        label: "Agregar Guión",
        onClick: handleMenuClick,
      },
      {
        key: "2",
        label: "Generar Resumen Semanal",
        onClick: handleMenuClick,
      },
    ]

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
        <>
          {localStorage.getItem('typeUser') === 'admin_user' ? (
            <Card 
            title="Lista de Guiones"
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
                  placeholder="Buscar Guión"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginBottom: 16 }}
              />
              <Table columns={ columns } dataSource={ filteredScripts } rowKey="id" />
          </Card>
          ) : (
            <Card 
            title="Lista de Guiones"
          
          >
            <Search
                placeholder="Buscar Guión"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredScripts } rowKey="id" />
          </Card>
          )}

          <ListResumenSemanal setModalResumen={setModalResumen} modalResumen={modalResumen} scripts={scripts} />
        </>
    );
}

export default ListScripts;