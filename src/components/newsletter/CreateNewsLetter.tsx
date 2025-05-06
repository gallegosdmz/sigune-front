"use client"

import type React from "react"
import { Form, Input, Button, Drawer, FormInstance, Select } from "antd"
import type { NewsLetter } from "../../interfaces/NewsLetter"
import * as NewsLetterUtils from "../../utils/NewsLetterUtils"
import { useIsMobile } from "../../hooks/use-media-query"

type Props = {
  setNewsLetters: (newsLetters: (prevUsers: NewsLetter[]) => NewsLetter[]) => void
  setVisibleAdd: (visibleAdd: boolean) => void
  visibleAdd: boolean,
  addForm: FormInstance
}

const CreateNewsLetter: React.FC<Props> = ({ setNewsLetters, setVisibleAdd, visibleAdd, addForm }) => {
  const isMobile = useIsMobile()

  return (
    <Drawer
      title="Añadir Nuevo Boletín"
      open={visibleAdd}
      onClose={() => NewsLetterUtils.handleAddCancel(setVisibleAdd, addForm)}
      width={isMobile ? "100%" : 520}
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "90vh" : undefined}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={() => NewsLetterUtils.handleAddSave(addForm, setNewsLetters, setVisibleAdd)} type="primary">
            Guardar
          </Button>
        </div>
      }
    >
      <Form form={addForm} layout="vertical">
        <Form.Item
            name="textContent"
            label="Contenido"
            rules={[{ required: true, message: "Por favor ingresa el contenido" }]}
        >
            <Input.TextArea
                rows={6} // altura inicial
                style={{ maxHeight: "200px", overflowY: "auto", resize: "vertical" }}
                placeholder="Escribe el contenido del boletín aquí..."
            />
        </Form.Item>
        <Form.Item name="dependence" label="Dependencia" rules={[{ required: true, message: "Por favor confirme la dependencia gubernamental" }]}>
            <Select placeholder="Selecciona una dependencia">
              <Select.Option value={"Secretaria de Salud"}>Secretaria de Salud</Select.Option>
              <Select.Option value={"Secreatria de Educación"}>Secreatria de Educación</Select.Option>
            </Select>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default CreateNewsLetter
