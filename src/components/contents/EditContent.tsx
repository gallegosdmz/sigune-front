import type React from "react"

import { Button, Modal, Form, Input, Space, Popconfirm, Upload, message, Select, Spin } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useCallback, useEffect, useRef, useState } from "react"
import ReactQuill from "react-quill"
import { InboxOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons"
import debounce from "lodash.debounce"
import SelectDailySummaryModal from "./SelectDailySummaryModal"

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
  const [loading, setLoading] = useState<boolean>(false) // Estado de loading
  const [errors, setErrors] = useState<any[]>([]);
  const [modalSelectDailySummary, setModalSelectDailySummary] = useState(false);
  const classification = Form.useWatch('classification', editForm);


  // Debounce: Espera 500ms después de que el usuario deja de escribir
  const debouncedCheck = useCallback(
    debounce((textToCheck: string) => {
      ContentUtils.checkSpelling(textToCheck, setErrors);
    }, 500),
    []
  );

  // 1. Efecto para setear datos del formulario
  useEffect(() => {
    if (content) {
      editForm.setFieldsValue({
        title: content.title,
        head: content.head,
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

  useEffect(() => {
    debouncedCheck(editorContent);
    // Limpia el debounce al desmontar el componente
    return () => debouncedCheck.cancel();
  }, [editorContent, debouncedCheck]);

  const handleSave = () => {
    if (visibleViewNote) {
      ContentUtils.handleEditSaveForContentsPanel(
        content!,
        editForm,
        setContents,
        script!,
        setVisibleViewNote,
        setLoading
      )
    } else {
      ContentUtils.handleEditSaveForContentsPanel(
        content!,
        editForm,
        setContents,
        script!,
        setVisibleViewSection,
        setLoading
      )
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
        title="Editar Nota"
        open={visibleViewNote}
        onCancel={() => ContentUtils.handleEditCancel(setVisibleViewNote, setFile)}
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
        <Spin spinning={loading}>
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: "Ingresa el título" }]}
            >
              <Input placeholder="Título" style={{ borderRadius: '4px' }} />
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

              {Array.isArray(file) && file.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4>Archivos actuales:</h4>
                  {file.map((fileItem, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <a
                        href={fileItem.viewLink}
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
                        {fileItem.name} - Ver en Google Drive
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalSelectDailySummary(true)}
                >
                  Agregar a Resumen Diario
                </Button>

                {localStorage.getItem('typeUser') === 'editor_user' ? (
                  <></>
                ) : (
                  <Button
                    type="primary"
                    onClick={() =>
                      handleSave()
                    }
                  >
                    Guardar
                  </Button>
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
        </Spin>
      </Modal>



      <Modal
        title="Editar Sección"
        open={visibleViewSection}
        onCancel={() => ContentUtils.handleAddCancel(setVisibleViewSection)}
        footer={null}
        centered
        width={800}
      >
        <Spin spinning={loading}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="title" label="Título" rules={[{ required: true, message: "Ingresa el título" }]}>
              <Input placeholder="Título" />
            </Form.Item>

            {/* Sección de botones en el centro abajo */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Space>
                <Button type="primary" onClick={() => handleSave()}>
                  Guardar
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>

      <SelectDailySummaryModal
        setModalSelectDailySummary={setModalSelectDailySummary}
        modalSelectDailySummary={modalSelectDailySummary}
        content={content}
        onSuccess={() => {
          // Aquí puedes agregar lógica adicional después de agregar el contenido al resumen
          console.log('Contenido agregado exitosamente al resumen diario');
        }}
      />
    </>
  );
};

export default EditContent;
