import React, { useEffect, useState } from "react";
import { Form, Input, Button, Drawer, Select, Checkbox } from "antd";
import { Role } from "../../interfaces/Role";
import * as DepartmentUtils from '../../utils/DepartmentUtils';
import * as RoleUtils from '../../utils/RoleUtils';
import { Department } from "../../interfaces/Department";
import { permissionsOptions } from "../../utils/Validations/ValidatePermissions";

type Props = {
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    visibleAdd: boolean
}

const CreateRole: React.FC<Props> = ({ setRoles, setVisibleAdd, visibleAdd }) => {

    // STATES
    const [ departments, setDepartments ] = useState<Department[]>([]);
    const [ selectedPermissions, setSelectedPermissions ] = useState<string[]>([]);

    // FORM
    const [ addFormRole ] = Form.useForm();
    
    useEffect(() => {
        DepartmentUtils.handleSetDepartments( setDepartments );
    });

    // Handle checkbox changes locally before calling the utility function
    const handleCheckboxChange = (checkedValues: string[]) => {
      // Call the utility function and update the form value
      const updatedValues = RoleUtils.handlePermissionsChange(checkedValues, setSelectedPermissions, permissionsOptions)

      // Update the form field value to ensure UI is in sync
      addFormRole.setFieldsValue({ permissions: updatedValues })
    }

    return (
        <Drawer
            title="Añadir Nuevo Puesto"
            open={ visibleAdd }
            onClose={ () => RoleUtils.handleAddCancel( setVisibleAdd, addFormRole ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    RoleUtils.handleAddSave(
                    addFormRole,
                    setRoles,
                    setVisibleAdd
                    )
                }
                type="primary"
                >
                Guardar
                </Button>
            </div>
            }
        >
            <Form form={ addFormRole } layout="vertical">
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
                            setVisibleAdd
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
                <Form.Item
                  name="permissions"
                  label="Permisos"
                  rules={[{ required: true, message: "Selecciona al menos un permiso" }]}
                >
                  <Checkbox.Group
                    options={permissionsOptions}
                    style={{ display: "flex", flexDirection: "column" }}
                    value={selectedPermissions}
                    onChange={(checkedValues) => handleCheckboxChange(checkedValues as string[])}
                  />
                </Form.Item>
            </Form>
        </Drawer>
    );
}

export default CreateRole;