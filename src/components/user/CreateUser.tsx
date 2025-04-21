import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Drawer, Select } from 'antd';
import { User } from '../../interfaces/User';
import * as UserUtils from '../../utils/UserUtils';
import * as RoleUtils from '../../utils/RoleUtils';
import { validateEmail } from '../../utils/Validations/ValidateEmail';
import { validatePassword } from '../../utils/Validations/ValidatePassword';
import { Role } from '../../interfaces/Role';

type Props = {
  setUsers: ( users: ( prevUsers: User[]) => User[] ) => void,
  setVisibleAdd: ( visibleAdd: boolean ) => void,
  visibleAdd: boolean,
}

const CreateUser: React.FC< Props > = ({ setUsers, setVisibleAdd, visibleAdd }) => {

    // STATES
    const [ roles, setRoles ] = useState<Role[]>([]);

    // FORM
    const [ addForm ] = Form.useForm();

    // AGREGAR ROLES
    useEffect(() => {
      RoleUtils.handleSetRoles( setRoles );
    }, []);

    return (
        <Drawer
          title="Añadir Nuevo Empleado"
          open={ visibleAdd }
          onClose={ () => UserUtils.handleAddCancel( setVisibleAdd, addForm ) }
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button
                onClick={() =>
                  UserUtils.handleAddSave(
                    addForm,
                    setUsers,
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
          <Form form={ addForm } layout="vertical">
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="surname"
              label="Apellido"
              rules={[
                { required: true, message: 'Por favor ingrese el apellido' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="institucionalEmail"
              label="Correo Institucional"
              rules={[
                  { required: true, message: 'Por favor ingresa un correo institucional' },
                  { validator: validateEmail }
              ]}
            >
              <Input autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  { validator: validatePassword }
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirmar Contraseña"
              rules={[
                { required: true, message: 'Por favor confirme la contraseña' }
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="role"
              label="Puesto"
              rules={[
                { required: true, message: 'Por favor confirme el puesto' }
              ]}
            >
              <Select placeholder="Selecciona un puesto">
                {roles.map(( role ) => (
                  <Select.Option key={ role.id } value={ role.id }>
                    { role.name }
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="numEmployee"
              label="Número de Empleado"
              rules={[
                { required: true, message: 'Por favor confirme el número de empleado' }
              ]}
            >
              <Input type='number'/>
            </Form.Item>
            <Form.Item
              name="phone"
              label="Teléfono"
              rules={[
                { required: true, message: 'Por favor ingrese el telefono' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Dirección"
              rules={[
                { required: true, message: 'Por favor confirme la dirección' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="curp"
              label="CURP"
              rules={[
                { required: true, message: 'Por favor confirme la CURP' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="rfc"
              label="RFC"
              rules={[
                { required: true, message: 'Por favor confirme el RFC' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dateAdmission"
              label="Fecha de Admisión"
              rules={[
                {
                  required: true,
                  message: 'Por favor confirme la fecha de admisión'
                }
              ]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="level"
              label="Nivel"
              rules={[
                { required: true, message: 'Por favor confirme el nivel' }
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="birthdate"
              label="Fecha de Nacimiento"
              rules={[
                {
                  required: true,
                  message: 'Por favor confirme la fecha de nacimiento'
                }
              ]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Genero"
              rules={[
                { required: true, message: 'Por favor confirme el genero' }
              ]}
            >
              <Select placeholder="Selecciona un genero">
                <Select.Option value={ 'MASCULINO' }>
                  Masculino
                </Select.Option>

                <Select.Option value={ 'fEMENINO' }>
                  Femenino
                </Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Drawer>
    );

}

export default CreateUser;