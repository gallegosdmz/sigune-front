"use client"

import type React from "react"

import { Button, message, Modal, Typography } from "antd"
import { useIsMobile } from "../../hooks/use-media-query"
import { Content } from "../../interfaces/Content"
import { useEffect, useState } from "react"
import { User } from "../../interfaces/User"
import Table, { ColumnsType } from "antd/es/table"
import { Script } from "../../interfaces/Script"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header } from "docx"
import { saveAs } from "file-saver"

type Props = {
  setModalResumen: (modalResumen: boolean) => void,
  modalResumen: boolean,
  contents: Content[]
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
  script?: number | Script | null;
  user?: User;
  createdAt: Date;
}

const { Title } = Typography

const ListResumen: React.FC<Props> = ({ setModalResumen, modalResumen, contents }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<Content[]>([]);

  useEffect(() => {
    const filter = contents.filter(content => content.type !== 'Sección');
    setData(filter);

  }, [modalResumen]);

  const isMobile = useIsMobile();


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
    script: item.script,
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
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const handleExport = async () => {
    
  };

  return (
    <Modal
      title={<Title level={4}>Generar Resumen Diario</Title>}
      open={modalResumen}
      onCancel={() => setModalResumen(false)}
      footer={[]}
      width={isMobile ? "95%" : 600}
      centered
      bodyStyle={{ padding: 16 }} // padding personalizado
    >
      <Table
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
      />

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button
          type="primary"
          onClick={handleExport}
          disabled={selectedRowKeys.length === 0}
        >
          Exportar Seleccionados
        </Button>
      </div>
    </Modal>
  )
}

export default ListResumen;
