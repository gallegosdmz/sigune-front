"use client"

import type React from "react"
import { Button, Modal, Form, Input, Space, message, Upload, Spin, Select } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useState, useEffect, useCallback } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { InboxOutlined } from "@ant-design/icons"
import debounce from 'lodash.debounce';

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
  const [errors, setErrors] = useState<any[]>([]);
  const classification = Form.useWatch('classification', addForm);

  // Debounce: Espera 500ms después de que el usuario deja de escribir
  const debouncedCheck = useCallback(
    debounce((textToCheck: string) => {
      ContentUtils.checkSpelling(textToCheck, setErrors);
    }, 500),
    []
  );

  // Reset form when modal closes
  useEffect(() => {
    if (!visibleAddNote && !visibleAddSection) {
      addForm.resetFields()
      setEditorContent("")
    }
  }, [visibleAddNote, visibleAddSection, addForm])

  useEffect(() => {
    debouncedCheck(editorContent);
    // Limpia el debounce al desmontar el componente
    return () => debouncedCheck.cancel();
  }, [editorContent, debouncedCheck]);

  const handleSave = () => {
    if (visibleAddNote) {
      ContentUtils.handleAddSave(addForm, setContents, script!, setVisibleAddNote, setLoading)
    } else {
      ContentUtils.handleAddSave(addForm, setContents, script!, setVisibleAddSection, setLoading)
    }
  }

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

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
        {errors.length > 0 && (
          <div style={{ marginTop: '20px', color: '#d32f2f' }}>
            <h3>Errores encontrados:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {errors.map((error, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <strong>{error.message}</strong>
                  <br />
                  <span style={{ background: '#ffebee', padding: '2px 4px' }}>
                    {stripHtml(error.context?.text)}
                  </span>
                  <br />
                  {error.replacements?.length > 0 && (
                    <span>
                      <em>Sugerencias: </em>
                      {error.replacements.map((r: any, i: number) => (
                        <span key={i} style={{ marginRight: '5px', color: '#1976d2' }}>
                          {r.value}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
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
                rules={[{ required: true, message: "Selecciona una dependencia" }]}
              >
                <Select placeholder="Selecciona una dependencia">
                  <Select.Option value="Secretaria de Salud">Secretaria de Salud</Select.Option>
                  <Select.Option value="Secreatria de Educación">Secreatria de Educación</Select.Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item
              label="Archivos multimedia"
              name="mediaFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            >
              <Upload.Dragger
                name="file"
                multiple={true}
                accept=".mp3,.wav,.ogg,.mp4,.mov,.avi,.mkv"
                beforeUpload={(file) => {
                  const isAudioOrVideo = file.type.includes("audio") || file.type.includes("video");

                  if (!isAudioOrVideo) {
                    message.error("Solo se permiten archivos de audio o video (.mp3, .wav, .mp4, etc.)");
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
                <p className="ant-upload-text">Haz clic o arrastra archivos de audio o video</p>
                <p className="ant-upload-hint">Se permiten archivos .mp3, .wav, .mp4, .mov, etc. menores a 10MB</p>
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
