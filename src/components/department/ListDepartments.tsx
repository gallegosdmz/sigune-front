import { Button, Card, FormInstance, Input as SearchInput, Space, Table } from "antd"
import { Department } from "../../interfaces/Department"
import { useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import * as DepartmentUtils from '../../utils/DepartmentUtils';

type Props = {
    departments: Department[],
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    setDepartment: ( department: Department ) => void,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
    editForm: FormInstance, 
}

const { Search } = SearchInput;

const ListDepartments: React.FC<Props> = ({ departments, setVisibleAdd, setVisibleEdit, setDepartment, setDepartments, editForm }) => {
    // STATES
    const [ searchTerm, setSearchTerm ] = useState('');

    // FILTERS
    const filteredDepartments = departments.filter(
        ( department ) =>
            department.name.toUpperCase().includes( searchTerm.toUpperCase() )  
    );

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Acción',
            key: 'action',
            className: 'action-column',
            render: ( record: Department ) => (
            <Space className="flex" size="middle">
                <Button
                icon={<EditOutlined className="text-blue-700" />}
                onClick={() => DepartmentUtils.handleEdit(
                    record,
                    setDepartment,
                    editForm,
                    setVisibleEdit
                )}
                />
                <Button
                icon={<DeleteOutlined className="text-red-700" />}
                onClick={() =>
                    DepartmentUtils.handleDelete(
                    record,
                    setDepartments
                    )}
                />
            </Space>
            )
        }
    ];

    return (
        <Card 
          title="Lista de Departamentos"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={ () => setVisibleAdd( true ) }>
              Agregar Departamento
            </Button>
          }
        >
            <Search
                placeholder="Buscar Departamento"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table columns={ columns } dataSource={ filteredDepartments } rowKey="id" />
        </Card>
    );

}

export default ListDepartments;
