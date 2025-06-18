"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Button, message, Modal, Typography, Input, Form, Select } from "antd"
import Table, { ColumnsType } from "antd/es/table"
import { useIsMobile } from "../../hooks/use-media-query"
import { Content } from "../../interfaces/Content"
import { User } from "../../interfaces/User"
import { mergeContents } from '../../services/ApiCalls'
import { handleErrorServer } from '../../utils/Custom/CustomErrors'

const { Title } = Typography
const { TextArea } = Input

// Función para limpiar HTML y obtener texto plano
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

type Props = {
  setModalMergeNotes: (modalMergeNotes: boolean) => void,
  modalMergeNotes: boolean,
  contents: Content[],
  dailySummaryId: number,
  onSuccess: () => void,
}

type TableItem = {
  key: number;
  type: string;
  title: string;
  textContent: string;
  dependence: string;
  classification: string;
  url?: string;
  position?: number;
  status: boolean;
  user?: User;
  createdAt: Date;
}

const MergeNotesModal: React.FC<Props> = ({ 
  setModalMergeNotes, 
  modalMergeNotes, 
  contents, 
  dailySummaryId,
  onSuccess 
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const isMobile = useIsMobile();

  useEffect(() => {
    const filter = contents.filter(content => content.type === 'Nota');
    setData(filter);
  }, [modalMergeNotes, contents]);

  const dataSource: TableItem[] = data.map((item, index) => ({
    key: Number(item.id ?? index),
    type: item.type,
    title: item.title,
    textContent: item.textContent,
    dependence: item.dependence,
    classification: item.classification,
    url: item.url,
    position: item.position,
    status: item.status,
    user: typeof item.user === "object" && item.user !== null ? item.user : undefined,
    createdAt: item.createdAt!
  })) || [];

  const columns: ColumnsType<TableItem> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: 'Fecha de Creado',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record) =>
        record.createdAt
          ? new Date(record.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          : "Fecha no disponible",
    },
    {
      title: "Usuario",
      dataIndex: "user",
      key: "user",
      render: (user?: User) => user ? `${user.name} ${user.surname}` : "Sin usuario",
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
      
      // Pre-llenar el textContent con el contenido de las notas seleccionadas
      if (newSelectedRowKeys.length >= 2) {
        const selectedItems = dataSource.filter(item => newSelectedRowKeys.includes(item.key));
        const combinedContent = selectedItems
          .map((item, index) => `--- NOTA ${index + 1} ---\n${stripHtml(item.textContent)}`)
          .join('\n\n');
        
        form.setFieldsValue({
          textContent: combinedContent
        });
      } else {
        form.setFieldsValue({
          textContent: ''
        });
      }
    },
  };

  const handleMerge = async () => {
    if (selectedRowKeys.length < 2) {
      message.warning("Debes seleccionar al menos 2 notas para resumir.");
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.key));
      const contentIdsToRemove = selectedItems.map(item => item.key);

      await mergeContents(dailySummaryId, contentIdsToRemove, {
        type: 'Nota',
        title: values.title,
        head: values.head,
        textContent: values.textContent,
        classification: values.classification,
        dependence: values.dependence || selectedItems[0]?.dependence || '',
        status: true,
      });

      message.success(`Se resumieron ${selectedItems.length} notas exitosamente.`);
      setModalMergeNotes(false);
      form.resetFields();
      setSelectedRowKeys([]);
      onSuccess();
    } catch (error) {
      console.log(error);
      handleErrorServer(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Resumir Notas</Title>}
      open={modalMergeNotes}
      onCancel={() => setModalMergeNotes(false)}
      footer={[]}
      width={isMobile ? "95%" : 800}
      centered
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ marginBottom: 16 }}>
        <p>Selecciona las notas que deseas resumir (mínimo 2):</p>
      </div>

      <Table
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />

      {selectedRowKeys.length >= 2 && (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Título del resumen"
            name="title"
            rules={[
              { required: true, message: 'Por favor ingresa el título del resumen' },
              { max: 100, message: 'El título no puede tener más de 100 caracteres' }
            ]}
          >
            <Input placeholder="Ingresa el título del resumen" />
          </Form.Item>

          <Form.Item
            label="Encabezado"
            name="head"
            rules={[
              { required: true, message: 'Por favor ingresa el encabezado' },
              { min: 50, message: 'El encabezado debe tener al menos 50 caracteres' }
            ]}
          >
            <Input placeholder="Ingresa el encabezado del resumen" />
          </Form.Item>

          <Form.Item
            label="Contenido del resumen"
            name="textContent"
            rules={[{ required: true, message: 'Por favor ingresa el contenido del resumen' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Ingresa el contenido resumido de las notas seleccionadas"
            />
          </Form.Item>

          <Form.Item
            label="Clasificación"
            name="classification"
            rules={[{ required: true, message: 'Por favor ingresa la clasificación' }]}
          >
            <Select placeholder="Selecciona una clasificación">
              <Select.Option value="Contenido General">Contenido General</Select.Option>
              <Select.Option value="Boletín">Boletín</Select.Option>
              <Select.Option value="Editoriales">Editoriales</Select.Option>
              <Select.Option value="Menciones">Menciones</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Dependencia"
            name="dependence"
          >
            <Input placeholder="Ingresa la dependencia (opcional)" />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button
              type="primary"
              onClick={handleMerge}
              loading={loading}
              disabled={selectedRowKeys.length < 2}
            >
              Resumir Notas
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default MergeNotesModal; 