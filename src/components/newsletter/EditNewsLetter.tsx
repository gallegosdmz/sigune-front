"use client"

import type React from "react"
import { Form, Input, Button, Drawer, FormInstance } from "antd"
import type { NewsLetter } from "../../interfaces/NewsLetter"
import * as NewsLetterUtils from "../../utils/NewsLetterUtils"
import { useIsMobile } from "../../hooks/use-media-query"

type Props = {
  newsLetter: NewsLetter | null,
  setNewsLetters: (newsLetters: (prevUsers: NewsLetter[]) => NewsLetter[]) => void
  setVisibleEdit: (visibleEdit: boolean) => void
  visibleEdit: boolean,
  editForm: FormInstance
}

const EditNewsLetter: React.FC<Props> = ({ newsLetter, setNewsLetters, setVisibleEdit, visibleEdit, editForm }) => {
  const isMobile = useIsMobile()

  return (
    <Drawer
      title="Editar Boletín"
      open={visibleEdit}
      onClose={() => NewsLetterUtils.handleEditCancel(setVisibleEdit, editForm)}
      width={isMobile ? "100%" : 520}
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "90vh" : undefined}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={() => NewsLetterUtils.handleEditSave(newsLetter!, editForm, setNewsLetters, setVisibleEdit)} type="primary">
            Guardar
          </Button>
        </div>
      }
    >
      <Form form={editForm} layout="vertical">
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
        <Form.Item name="dependence" label="Dependencia" rules={[{ required: true, message: "Por favor ingresa la dependencia gubernamental" }]}>
          <Input placeholder="Ingresa la dependencia gubernamental" style={{ borderRadius: '4px' }} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default EditNewsLetter
