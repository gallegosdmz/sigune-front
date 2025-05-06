"use client"

import type React from "react"
import { Button, Modal, Form, Input, Space, message, Upload, Spin, Select } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { InboxOutlined } from "@ant-design/icons"

type Props = {
  script: number | null
  setContents: (content: (prevContent: Content[]) => Content[]) => void
  setVisibleAddNote: (visibleAddNote: boolean) => void
  setVisibleAddSection: (visibleAddSection: boolean) => void
  visibleAddNote: boolean
  visibleAddSection: boolean
}

const CreateContent: React.FC<Props> = ({
  script,
  setContents,
  setVisibleAddNote,
  setVisibleAddSection,
  visibleAddNote,
  visibleAddSection,
}) => {
  const [addForm] = Form.useForm()
  const [editorContent, setEditorContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false) // Estado de loading


  // Reset form when modal closes
  useEffect(() => {
    if (!visibleAddNote && !visibleAddSection) {
      addForm.resetFields()
      setEditorContent("")
    }
  }, [visibleAddNote, visibleAddSection, addForm])

  const handleSave = () => {
    if (visibleAddNote) {
      ContentUtils.handleAddSave(addForm, setContents, script!, setVisibleAddNote, setLoading)
    } else {
      ContentUtils.handleAddSave(addForm, setContents, script!, setVisibleAddSection, setLoading)
    }
  }

  // Quill editor modules and formats configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
  ]

  return (
    <>
      <Modal
        title={<div style={{ textAlign: "left" }}>{visibleAddNote ? "Agregar Nota" : "Agregar Sección"}</div>}
        open={visibleAddNote}
        onCancel={() => ContentUtils.handleAddCancel(setVisibleAddNote)}
        footer={null}
        centered
        width={800}
        style={{ padding: '20px' }}
      >
        <Spin spinning={loading}> {/* Mostrar el Spinner mientras loading es true */}
                  <Form form={addForm} layout="vertical">
                      <Form.Item
                          name="title"
                          label="Titulo"
                          rules={[{ required: true, message: "Ingresa el titulo" }]}
                      >
                          <Input placeholder="Titulo" style={{ borderRadius: '4px' }} />
                      </Form.Item>

                      <Form.Item
                          label="Contenido"
                          name="textContent"
                          rules={[{ required: true, message: "El contenido es requerido" }]}
                          getValueFromEvent={(e) => e}
                      >
                          <ReactQuill
                              theme="snow"
                              value={editorContent}
                              onChange={setEditorContent}
                              modules={modules}
                              formats={formats}
                              style={{
                                  height: 300,
                                  marginBottom: 5,
                                  borderRadius: 4,
                                  border: "1px solid #d9d9d9",
                                  overflow: "hidden",
                                  marginTop: '10px'
                              }}
                              className="custom-quill"
                          />
                      </Form.Item>

                      <Form.Item
                          name="dependence"
                          label="Dependencia"
                          rules={[{ required: true, message: "Ingresa la dependencia gubernamental" }]}
                      >
                          <Select placeholder="Selecciona una dependencia">
                            <Select.Option value={"Secretaria de Salud"}>Secretaria de Salud</Select.Option>
                            <Select.Option value={"Secreatria de Educación"}>Secreatria de Educación</Select.Option>
                          </Select>
                      </Form.Item>

                      <Form.Item
                          name="classification"
                          label="Clasificación"
                          initialValue="Contenido General"
                          rules={[{ required: true, message: "Ingresa la clasificación" }]}
                      >
                          <Select placeholder="Selecciona una clasificación">
                            <Select.Option value={"Contenido General"}>Contenido General</Select.Option>
                            <Select.Option value={"Boletín"}>Boletín</Select.Option>
                            <Select.Option value={"Editoriales"}>Editoriales</Select.Option>
                            <Select.Option value={"Menciones"}>Menciones</Select.Option>
                          </Select>
                      </Form.Item>

                      <Form.Item
                          label="Archivo de audio"
                          name="audioFile"
                          valuePropName="fileList"
                          getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                      >
                          <Upload.Dragger
                              name="file"
                              multiple={false}
                              accept=".mp3,.wav"
                              beforeUpload={(file) => {
                                  const isAudio = file.type.includes("audio");

                                  if (!isAudio) {
                                      message.error("Solo se permiten archivos de audio (.mp3 o .wav)");
                                      return Upload.LIST_IGNORE;
                                  }

                                  return false; // Evita la subida automática
                              }}
                              showUploadList={{ showRemoveIcon: true }}
                              style={{ marginTop: '20px' }}
                          >
                              <p className="ant-upload-drag-icon">
                                  <InboxOutlined />
                              </p>
                              <p className="ant-upload-text">Haz clic o arrastra un archivo de audio</p>
                              <p className="ant-upload-hint">Solo archivos .mp3 o .wav menores a 10MB</p>
                          </Upload.Dragger>
                      </Form.Item>

                      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                          <Space>
                              <Button type="primary" onClick={handleSave}>
                                  Guardar
                              </Button>
                          </Space>
                      </div>
                  </Form>
              </Spin>
          </Modal>
  
      <Modal
        title={<div style={{ textAlign: "left" }}>{visibleAddNote ? "Agregar Nota" : "Agregar Sección"}</div>}
        open={visibleAddSection}
        onCancel={() => ContentUtils.handleAddCancel(setVisibleAddSection)}
        footer={null}
        centered
        width={800}
        style={{ padding: '20px' }}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="title"
            label="Titulo"
            rules={[{ required: true, message: "Ingresa el titulo" }]}
          >
            <Input placeholder="Titulo" style={{ borderRadius: '4px' }} />
          </Form.Item>
  
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" onClick={handleSave}>
                Guardar
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
  
}

export default CreateContent
