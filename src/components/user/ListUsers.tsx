import { Table, Card, Input as SearchInput, Button, Space, FormInstance } from 'antd';
import { useState } from 'react';
import { User } from '../../interfaces/User';
import { DatabaseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import * as UserUtils from '../../utils/UserUtils';

type Props = {
    users: User[],
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    setUser: ( user: User ) => void,
    setUsers: ( users: ( prevUsers: User[] ) => User[] ) => void, 
    setModalView: ( modalView: boolean ) => void,
    editForm: FormInstance
}

const { Search } = SearchInput;

const ListUsers: React.FC< Props > = ({ users, setVisibleAdd, setVisibleEdit, setUser, setUsers, setModalView, editForm }) => {

    // STATES
    const [ searchTerm, setSearchTerm ] = useState('');

    // FILTERS
    const filteredUsers = users.filter(
        ( user ) =>
            user.name.toUpperCase().includes( searchTerm.toUpperCase() ) ||
            user.surname.toUpperCase().includes( searchTerm.toUpperCase() ) ||
            user.institucionalEmail.toUpperCase().includes( searchTerm.toUpperCase() )
    );

    // Columnas de Tabla
    const columns = [
        {
          title: 'Nombre',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: 'Apellidos',
          dataIndex: 'surname',
          key: 'surname',
        },
        {
          title: 'Correo',
          dataIndex: 'institucionalEmail',
          key: 'institucionalEmail',
        },
        {
          title: 'Puesto',
          dataIndex: ['role', 'name'],
          key: 'role',
          sorter: (a: any, b: any) => (a.role?.name || '').localeCompare(b.role?.name || ''),
          render: (record: any) => {
            return record || 'Sin puesto';
          }
        },
        {
          title: 'Departamento',
          dataIndex: ['role', 'department', 'name'],
          key: 'department',
          sorter: (a: any, b: any) => (a.role?.department?.name || '').localeCompare(b.role?.department?.name || ''),
          render: (record: any) => {
            return record || 'Sin departamento';
          }
        },        
        {
          title: 'Acción',
          key: 'action',
          className: 'action-column',
          render: ( record: User ) => (
            <Space className="flex" size="middle">
              <Button
                icon={<DatabaseOutlined className="text-green-700" />}
                onClick={() =>
                  UserUtils.handleModalView(
                    record.id!,
                    setUser,
                    setModalView
                  )
                }
              />
              <Button
                icon={<EditOutlined className="text-blue-700" />}
                onClick={() => UserUtils.handleEdit(
                  record,
                  setUser,
                  editForm,
                  setVisibleEdit
                )}
              />
              <Button
                icon={<DeleteOutlined className="text-red-700" />}
                onClick={() =>
                  UserUtils.handleDelete(
                    record,
                    setUsers
                  )}
              />
            </Space>
          )
        }
      ];

    return (
        <Card 
          title="Lista de Empleados"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAdd( true ) }>
              Agregar Usuario
            </Button>
          }
        >
            <Search
                placeholder="Buscar Empleado"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredUsers } rowKey="id" />
        </Card>
    );
}

export default ListUsers;