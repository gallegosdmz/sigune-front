import { Button, Checkbox, Drawer, Form, FormInstance, Input, Select } from "antd"
import { Role } from "../../interfaces/Role"
import { useEffect, useState } from "react"
import { Department } from "../../interfaces/Department"
import * as DepartmentUtils from '../../utils/DepartmentUtils';
import * as RoleUtils from '../../utils/RoleUtils';
import { permissionsOptions } from "../../utils/Validations/ValidatePermissions";

type Props = {
    role: Role | null,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void,
    setVisibleEditRole: ( visibleEditRole: boolean ) => void,
    visibleEditRole: boolean,
    editFormRole: FormInstance
}

const EditRole: React.FC<Props> = ({ role, setRoles, setVisibleEditRole, visibleEditRole, editFormRole }) => {
    // STATES
    const [ departments, setDepartments ] = useState<Department[]>([]);

    // AGREGAR DEPARTMENTS
    useEffect(() => {
        DepartmentUtils.handleSetDepartments( setDepartments );
    }, []);

    return (
        <Drawer
            title="Editar Puesto"
            open={ visibleEditRole }
            onClose={ () => RoleUtils.handleEditCancel( setVisibleEditRole, editFormRole ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    RoleUtils.handleEditSave(
                    role,
                    editFormRole,
                    setRoles,
                    setVisibleEditRole
                    )
                }
                type="primary"
                >
                Guardar
                </Button>
            </div>
            }
        >
            <Form form={ editFormRole } layout="vertical">
                <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                  <Input placeholder="Nombre" />
                </Form.Item>
                <Form.Item name="department" label="Departamento" rules={[{ required: true, message: 'Ingresa el departamento' }]}>
                  <Select
                    placeholder="Selecciona un departamento"
                    dropdownRender={( menu ) => (
                      <>
                        { menu }
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: 8
                          }}
                        >
                          <Button type='link' onClick={() => DepartmentUtils.handleAdd(
                            setVisibleEditRole
                          )}>
                            Añadir Departamento
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    { departments.map( ( department ) => (
                      <Select.Option key={ department.id } value={ department.id }>
                        { department.name }
                      </Select.Option>
                    ))}

                  </Select>
                </Form.Item>
                <Form.Item name="permissions" label="Permisos" rules={[{ required: true, message: "Selecciona al menos un permiso" }]}>
                  <Checkbox.Group options={permissionsOptions} style={{ display: "flex", flexDirection: "column" }} />
                </Form.Item>
            </Form>
        </Drawer>
    );
}

export default EditRole;