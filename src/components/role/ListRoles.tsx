import { useState } from "react";
import { Role } from "../../interfaces/Role";
import { Button, Card, Input as SearchInput, FormInstance, Space, Table } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import * as RoleUtils from '../../utils/RoleUtils';

type Props = {
    roles: Role[],
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    setRole: ( role: Role ) => void,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void,
    editFormRole: FormInstance
}

const { Search } = SearchInput;

const ListRoles: React.FC<Props> = ({ roles, setVisibleAdd, setVisibleEdit, setRole, setRoles, editFormRole }) => {
    
    // STATES
    const [ searchTermRoles, setSearchTermRoles ] = useState('');

    //FILTERS
    const filteredRoles = roles.filter(
        ( role ) => 
            role.name.toUpperCase().includes( searchTermRoles.toUpperCase() )
    );

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Departamento',
            dataIndex: 'department',
            key: 'department',
            render: (record: Role) => {
                return record.name || 'Sin departamento';
            }
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: ( record: Role ) => (
              <Space className="flex" size="middle">
                <Button
                  icon={<EditOutlined className="text-blue-700" />}
                  onClick={() => RoleUtils.handleEdit(
                    record,
                    setRole,
                    editFormRole,
                    setVisibleEdit
                 )}
                />
                <Button
                  icon={<DeleteOutlined className="text-red-700" />}
                  onClick={() =>
                    RoleUtils.handleDelete(
                      record,
                      setRoles
                  )}
                />
              </Space>
            )
          }
    ];
    
    return (
      <Card 
        title="Lista de Puestos"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAdd( true ) }>
            Agregar Puesto
          </Button>
        }
      >
          <Search
              placeholder="Buscar Empleado"
              onChange={(e) => setSearchTermRoles(e.target.value)}
              style={{ marginBottom: 16 }}
          />
          <Table columns={ columns } dataSource={ filteredRoles } rowKey="id" />
      </Card>
    )
}

export default ListRoles;