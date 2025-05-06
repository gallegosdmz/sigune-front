import type React from "react"

import { Button, Modal, Form, Input, Space, Popconfirm, Upload, message, Select } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useEffect, useRef, useState } from "react"
import ReactQuill from "react-quill"
import { InboxOutlined, PlayCircleOutlined } from "@ant-design/icons"

type Props = {
  content: Content | null,
  script: number | null,
  file: any | null,
  setFile: (file: any) => void,
  setContents: (content: (prevContent: Content[]) => Content[]) => void,
  setVisibleViewNote: (visibleViewNote: boolean) => void,
  setVisibleViewSection: (visibleViewSection: boolean) => void,
  visibleViewNote: boolean,
  visibleViewSection: boolean
}

const EditContent: React.FC<Props> = ({ content, script, file, setFile, setContents, setVisibleViewNote, setVisibleViewSection, visibleViewNote, visibleViewSection }) => {
  const quillRef = useRef<ReactQuill | null>(null);
  
  const [editForm] = Form.useForm();
  const [editorContent, setEditorContent] = useState<string>("")
  

  // 1. Efecto para setear datos del formulario
  useEffect(() => {
    if (content) {
      editForm.setFieldsValue({
        title: content.title,
        textContent: content.textContent,
        dependence: content.dependence,
        classification: content.classification
      });
      setEditorContent(content.textContent); // Esto también es importante
    }
  }, [content, editForm]);

  // 2. Efecto separado para bloquear selección/copiar
  useEffect(() => {
    if (!visibleViewNote || !quillRef.current) return;
  
    const timeout = setTimeout(() => {
      const editor = quillRef.current?.getEditor?.();
      const editorDiv = editor?.root;
  
      if (editorDiv) {
        editorDiv.style.userSelect = "none";
  
        const handleCopy = (e: ClipboardEvent) => e.preventDefault();
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
  
        editorDiv.addEventListener("copy", handleCopy);
        editorDiv.addEventListener("contextmenu", handleContextMenu);
  
        return () => {
          editorDiv.removeEventListener("copy", handleCopy);
          editorDiv.removeEventListener("contextmenu", handleContextMenu);
        };
      }
    }, 100); // esperar un poco a que el editor se renderice
  
    return () => clearTimeout(timeout);
  }, [visibleViewNote]);



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
        title="Editar Nota"
        open={visibleViewNote}
        onCancel={() => ContentUtils.handleEditCancel(setVisibleViewNote, setFile)}
        footer={null}
        centered
        width={800}
        style={{ padding: '20px' }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: "Ingresa el título" }]}
          >
            <Input placeholder="Título" style={{ borderRadius: '4px' }} />
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
              ref={quillRef}
              onChange={setEditorContent}
              modules={modules}
              formats={formats}
              style={{
                height: 300,
                marginBottom: 5,
                borderRadius: 4,
                border: "1px solid #d9d9d9",
                overflow: "hidden",
                marginTop: '10px',
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
                return false;
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

            {file?.viewLink && (
              <div style={{ marginTop: 16 }}>
                <a
                  href={file.viewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: '#1890ff',
                    fontWeight: 500,
                  }}
                >
                  <PlayCircleOutlined style={{ fontSize: '18px', marginRight: 8 }} />
                  Escuchar audio en Google Drive
                </a>
              </div>
            )}
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Space>
              {localStorage.getItem('typeUser') === 'editor_user' ? (
                <></>
              ) : (
                <Button
                type="primary"
                onClick={() =>
                  ContentUtils.handleEditSave(
                    content!,
                    editForm,
                    setContents,
                    script!,
                    setVisibleViewNote
                  )
                }
              >
                Guardar
              </Button>
              )}

              {localStorage.getItem('typeUser') === 'admin_user' && (
                content?.status ? (
                  <Popconfirm
                    title="¿Estás seguro de desaprobar esta nota?"
                    onConfirm={() =>
                      ContentUtils.handleDisapprove(content!, script!, setContents, setVisibleViewNote)
                    }
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button className="bg-amber-500 text-white">Desaprobar</Button>
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="¿Estás seguro de aprobar esta nota?"
                    onConfirm={() =>
                      ContentUtils.handleApprove(content!, script!, setContents, setVisibleViewNote)
                    }
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button className="bg-green-500 text-white" type="default">Aprobar</Button>
                  </Popconfirm>
                )
              )}


              {localStorage.getItem('typeUser') === 'admin_user' ? (
                <Popconfirm
                title="¿Estás seguro de eliminar esta nota?"
                onConfirm={() => {
                  ContentUtils.handleDelete(content!, script!, setContents, setVisibleViewNote);
                }}
                okText="Eliminar"
                okType="danger"
                cancelText="Cancelar"
              >
                <Button danger type="primary">
                  Eliminar
                </Button>
              </Popconfirm>
              ) : (
                <></>
              )}
              
            </Space>
          </div>
        </Form>
      </Modal>



      <Modal
        title="Editar Sección"
        open={visibleViewSection}
        onCancel={() => ContentUtils.handleAddCancel(setVisibleViewSection)}
        footer={null}
        centered
        width={800}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="title" label="Título" rules={[{ required: true, message: "Ingresa el título" }]}>
            <Input placeholder="Título" />
          </Form.Item>

          {/* Sección de botones en el centro abajo */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" onClick={() => ContentUtils.handleEditSave(content!, editForm, setContents, script!, setVisibleViewSection)}>
                Guardar
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default EditContent;
