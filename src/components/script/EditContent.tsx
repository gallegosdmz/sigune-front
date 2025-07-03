import type React from "react"

import { Button, Modal, Form, Input, Space, Popconfirm, Upload, message, Select, Spin } from "antd"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useEffect, useState } from "react"
import { InboxOutlined, PlayCircleOutlined } from "@ant-design/icons"

type Props = {
  content: Content | null,
  script: number | null,
  file: any | null,
  setFile: (file: any) => void,
  setContents: (content: (prevContent: Content[]) => Content[]) => void,
  setVisibleViewNote: (visibleViewNote: boolean) => void,
  setVisibleViewSection: (visibleViewSection: boolean) => void,
  setVisibleViewAdvance: (visibleViewAdvance: boolean) => void,
  visibleViewNote: boolean,
  visibleViewSection: boolean,
  visibleViewAdvance: boolean
}

const EditContent: React.FC<Props> = ({ content, script, file, setFile, setContents, setVisibleViewNote, setVisibleViewSection, setVisibleViewAdvance, visibleViewNote, visibleViewSection, visibleViewAdvance }) => {
  const [editForm] = Form.useForm();
  const [editorContent, setEditorContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false) // Estado de loading
  const classification = Form.useWatch('classification', editForm);

  // 1. Efecto para setear datos del formulario
  useEffect(() => {
    if (content) {
      let html = content.textContent || '';
      // Reemplaza <br> por saltos de línea y &nbsp; por espacios
      html = html.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ');
      // Usa el DOM para obtener el texto plano
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      setEditorContent(plainText);
      editForm.setFieldsValue({
        title: content.title,
        head: content.head,
        dependence: content.dependence,
        classification: content.classification
      });
    }
  }, [content, editForm]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
  };

  const handleSave = async () => {
    // Convierte el texto plano a HTML antes de guardar
    const htmlContent = editorContent
      .replace(/\n/g, '<br>')
      .replace(/\s{2,}/g, (match) => '&nbsp;'.repeat(match.length));
    await editForm.setFieldValue('textContent', htmlContent);
    setTimeout(() => {
      if (visibleViewNote) {
        ContentUtils.handleEditSave(
          content!,
          editForm,
          setContents,
          script!,
          setVisibleViewNote,
          setLoading
        )
      } else if (visibleViewSection) {
        ContentUtils.handleEditSave(
          content!,
          editForm,
          setContents,
          script!,
          setVisibleViewSection,
          setLoading
        )
      } else if (visibleViewAdvance) {
        ContentUtils.handleEditSave(
          content!,
          editForm,
          setContents,
          script!,
          setVisibleViewAdvance,
          setLoading
        )
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
        title="Editar Nota"
        open={visibleViewNote}
        onCancel={() => ContentUtils.handleEditCancel(setVisibleViewNote, setFile)}
        footer={null}
        centered
        width={800}
        style={{ padding: '20px' }}
      >
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
              label="Archivos multimedia"
              name="mediaFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
            >
              <Upload.Dragger
                name="file"
                multiple={true}
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
                <p className="ant-upload-text">Haz clic o arrastra archivos de audio o video</p>
                <p className="ant-upload-hint">Se permiten archivos .mp3, .wav, .m4a, .mp4, .mov, etc. menores a 10MB</p>
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

            <Form.Item name="textContent" style={{ display: 'none' }}>
              <input type="hidden" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Space>
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

      <Modal
        title="Editar Avance"
        open={visibleViewAdvance}
        onCancel={() => ContentUtils.handleAddCancel(setVisibleViewAdvance)}
        footer={null}
        centered
        width={800}
        style={{ padding: '20px' }}
      >
        <Spin spinning={loading}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="title" label="Título" rules={[{ required: true, message: "Ingresa el título" }]}>
              <Input placeholder="Título" style={{ borderRadius: '4px' }} />
            </Form.Item>

            <Form.Item name="head" initialValue="isAdvance" style={{ display: 'none' }}>
              <input type="hidden" />
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
    </>
  );
};

export default EditContent;
