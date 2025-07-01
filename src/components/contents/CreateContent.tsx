"use client"

import type React from "react"
import { Button, Modal, Form, Input, Space, message, Upload, Spin, Select } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useState, useEffect } from "react"
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
  const classification = Form.useWatch('classification', addForm);

  // Reset form when modal closes
  useEffect(() => {
    if (!visibleAddNote && !visibleAddSection) {
      addForm.resetFields()
      setEditorContent("")
    }
  }, [visibleAddNote, visibleAddSection, addForm])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    // No convertir a HTML aquí
  };

  const handleSave = async () => {
    // Convierte el texto plano a HTML antes de guardar
    const htmlContent = editorContent
      .replace(/\n/g, '<br>')
      .replace(/\s{2,}/g, (match) => '&nbsp;'.repeat(match.length));
    addForm.setFieldValue('textContent', htmlContent);
    // Espera a que el valor se actualice antes de guardar
    setTimeout(() => {
      if (visibleAddNote) {
        ContentUtils.handleAddSaveForContentsPanel(addForm, setContents, script!, setVisibleAddNote, setLoading)
      } else {
        ContentUtils.handleAddSaveForContentsPanel(addForm, setContents, script!, setVisibleAddSection, setLoading)
      }
    }, 0);
  };

  // Estilos CSS para el textarea
  const textareaStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '300px',
    padding: '12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    resize: 'vertical' as const,
    outline: 'none',
    transition: 'border-color 0.3s ease',
  };

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1890ff';
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#d9d9d9';
  };

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
              name="head"
              label="Cabeza"
              rules={[
                { required: true, message: "Ingresa la cabeza" },
                {
                  validator: (_, value) => {
                    if (!value || value.length >= 50) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("La cabeza debe tener al menos 50 caracteres"));
                  },
                },
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input placeholder="Cabeza" style={{ borderRadius: '4px' }} />
            </Form.Item>

            <Form.Item
              label="Contenido"
              name="textContent"
              rules={[{ required: true, message: "El contenido es requerido" }]}
            >
              <textarea
                value={editorContent}
                onChange={handleTextareaChange}
                onFocus={handleTextareaFocus}
                onBlur={handleTextareaBlur}
                placeholder="Escribe el contenido aquí..."
                style={textareaStyles}
              />
            </Form.Item>

            {localStorage.getItem('typeUser') === 'admin_user' ? (
              <Form.Item
                name="classification"
                label="Clasificación"
                initialValue="Contenido General"
                rules={[{ required: true, message: "Ingresa la clasificación" }]}
              >
                <Select placeholder="Selecciona una clasificación">
                  <Select.Option value="Contenido General">Contenido General</Select.Option>
                  <Select.Option value="Boletín">Boletín</Select.Option>
                  <Select.Option value="Editoriales">Editoriales</Select.Option>
                  <Select.Option value="Menciones">Menciones</Select.Option>
                </Select>
              </Form.Item>
            ) : (
              <></>
            )}

            {["Boletín", "Editoriales", "Menciones"].includes(classification) && (
              <Form.Item
                name="dependence"
                label="Dependencia"
                rules={[{ required: true, message: "Ingresa la dependencia" }]}
              >
                <Input placeholder="Ingresa la dependencia" style={{ borderRadius: '4px' }} />
              </Form.Item>
            )}

            <Form.Item
              label="Archivo multimedia"
              name="mediaFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            >
              <Upload.Dragger
                name="file"
                multiple={false}
                accept=".mp3,.wav,.ogg,.m4a,.mp4,.mov,.avi,.mkv"
                beforeUpload={(file) => {
                  const isAudioOrVideo = file.type.includes("audio") || file.type.includes("video");

                  if (!isAudioOrVideo) {
                    message.error("Solo se permiten archivos de audio o video (.mp3, .wav, .m4a, .mp4, etc.)");
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
                <p className="ant-upload-text">Haz clic o arrastra un archivo de audio o video</p>
                <p className="ant-upload-hint">Se permiten archivos .mp3, .wav, .m4a, .mp4, .mov, etc. menores a 10MB</p>
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