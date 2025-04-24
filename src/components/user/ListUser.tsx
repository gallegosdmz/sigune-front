"use client"

import type React from "react"

import { Modal, Typography, Descriptions } from "antd"
import type { User } from "../../interfaces/User"
import { useIsMobile } from "../../hooks/use-media-query"

type Props = {
  user: User | null
  modalView: boolean
  setModalView: (modalView: boolean) => void
}

const { Title } = Typography

const ListUser: React.FC<Props> = ({ user, modalView, setModalView }) => {
  const isMobile = useIsMobile()

  let role
  let department

  if (typeof user?.role === "object") {
    role = user.role.name
    department = typeof user.role.department === "object" ? user.role.department.name : "No encontrado"
  }

  return (
    <Modal
      title={<Title level={4}>Detalles del Empleado</Title>}
      open={modalView}
      onCancel={() => setModalView(false)}
      footer={[]}
      width={isMobile ? "95%" : 600}
      centered
    >
      {user && (
        <Descriptions layout={isMobile ? "vertical" : "horizontal"} column={isMobile ? 1 : 2} bordered>
          <Descriptions.Item label="Nombre">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Apellidos">{user.surname}</Descriptions.Item>
          <Descriptions.Item label="Correo Institucional">{user.institucionalEmail}</Descriptions.Item>
          <Descriptions.Item label="Puesto">{role || "No asignado"}</Descriptions.Item>
          <Descriptions.Item label="Departamento">{department || "No asignado"}</Descriptions.Item>
          <Descriptions.Item label="Número de Empleado">{user.numEmployee}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{user.phone}</Descriptions.Item>
          <Descriptions.Item label="Dirección">{user.address}</Descriptions.Item>
          <Descriptions.Item label="CURP">{user.curp}</Descriptions.Item>
          <Descriptions.Item label="RFC">{user.rfc}</Descriptions.Item>
          <Descriptions.Item label="Fecha de Admisión">
            {new Date(user.dateAdmission!).toLocaleDateString("es-ES")}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}

export default ListUser
