"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Form, Input, Button, Drawer, Select, type FormInstance } from "antd"
import type { User } from "../../interfaces/User"
import * as UserUtils from "../../utils/UserUtils"
import * as RoleUtils from "../../utils/RoleUtils"
import { validateEmail } from "../../utils/Validations/ValidateEmail"
import type { Role } from "../../interfaces/Role"
import { useIsMobile } from "../../hooks/use-media-query"

type Props = {
  user: User | null
  setUsers: (users: (prevUsers: User[]) => User[]) => void
  setVisibleEdit: (visibleEdit: boolean) => void
  visibleEdit: boolean
  editForm: FormInstance
}

const EditUser: React.FC<Props> = ({ user, setUsers, setVisibleEdit, visibleEdit, editForm }) => {
  // STATES
  const [roles, setRoles] = useState<Role[]>([])
  const isMobile = useIsMobile()

  // AGREGAR ROLES
  useEffect(() => {
    RoleUtils.handleSetRoles(setRoles)
  }, [])

  return (
    <Drawer
      title="Editar Empleado"
      open={visibleEdit}
      onClose={() => UserUtils.handleEditCancel(setVisibleEdit, editForm)}
      width={isMobile ? "100%" : 520}
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "90vh" : undefined}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={() => UserUtils.handleEditSave(user, editForm, setUsers, setVisibleEdit)} type="primary">
            Guardar
          </Button>
        </div>
      }
    >
      <Form form={editForm} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Por favor ingrese el nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Apellido"
            rules={[{ required: true, message: "Por favor ingrese el apellido" }]}
          >
            <Input />
          </Form.Item>
        </div>

        <Form.Item
          name="institucionalEmail"
          label="Correo Institucional"
          rules={[
            { required: true, message: "Por favor ingresa un correo institucional" },
            { validator: validateEmail },
          ]}
        >
          <Input autoComplete="username" />
        </Form.Item>

        <Form.Item name="role" label="Puesto" rules={[{ required: true, message: "Por favor confirme el puesto" }]}>
          <Select placeholder="Selecciona un puesto">
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="numEmployee"
            label="Número de Empleado"
            rules={[{ required: true, message: "Por favor confirme el número de empleado" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[{ required: true, message: "Por favor ingrese el telefono" }]}
          >
            <Input />
          </Form.Item>
        </div>

        <Form.Item
          name="address"
          label="Dirección"
          rules={[{ required: true, message: "Por favor confirme la dirección" }]}
        >
          <Input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="curp" label="CURP" rules={[{ required: true, message: "Por favor confirme la CURP" }, {validator: UserUtils.handleValidateCURP}]}>
            <Input />
          </Form.Item>
          <Form.Item name="rfc" label="RFC" rules={[{ required: true, message: "Por favor confirme el RFC" }, {validator: UserUtils.handleValidateRFC}]}>
            <Input />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="dateAdmission"
            label="Fecha de Admisión"
            rules={[
              {
                required: true,
                message: "Por favor confirme la fecha de admisión",
              },
            ]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item name="level" label="Nivel" rules={[{ required: true, message: "Por favor confirme el nivel" }]}>
            <Input type="number" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="birthdate"
            label="Fecha de Nacimiento"
            rules={[
              {
                required: true,
                message: "Por favor confirme la fecha de nacimiento",
              },
            ]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item name="gender" label="Genero" rules={[{ required: true, message: "Por favor confirme el genero" }]}>
            <Select placeholder="Selecciona un genero">
              <Select.Option value={"MASCULINO"}>Masculino</Select.Option>

              <Select.Option value={"fEMENINO"}>Femenino</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  )
}

export default EditUser
