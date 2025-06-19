"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Button, message, Modal, Typography, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { useIsMobile } from "../../hooks/use-media-query"
import { DailySummary } from "../../interfaces/DailySummary"
import { Content } from "../../interfaces/Content"
import { getDailySummarys, addContentToDailySummary } from '../../services/ApiCalls'
import { handleErrorServer } from '../../utils/Custom/CustomErrors'

const { Title } = Typography

type Props = {
  setModalSelectDailySummary: (modalSelectDailySummary: boolean) => void,
  modalSelectDailySummary: boolean,
  content: Content | null,
  onSuccess: () => void,
}

const SelectDailySummaryModal: React.FC<Props> = ({ 
  setModalSelectDailySummary, 
  modalSelectDailySummary, 
  content,
  onSuccess 
}) => {
  const [dailySummarys, setDailySummarys] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (modalSelectDailySummary) {
      fetchDailySummarys();
    }
  }, [modalSelectDailySummary]);

  const fetchDailySummarys = async () => {
    try {
      setTableLoading(true);
      const data = await getDailySummarys();
      setDailySummarys(data);
    } catch (error) {
      handleErrorServer(error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSelectDailySummary = async (dailySummary: DailySummary) => {
    if (!content) {
      message.error("No hay contenido seleccionado");
      return;
    }

    try {
      setLoading(true);
      
      await addContentToDailySummary(dailySummary.id!, content.id!);
      
      message.success(`Contenido agregado al resumen diario del ${new Date(dailySummary.date).toLocaleDateString("es-ES")}`);
      setModalSelectDailySummary(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      handleErrorServer(error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DailySummary> = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    },
    {
      title: "Contenidos",
      dataIndex: "contents",
      key: "contents",
      render: (contents: Content[] | number[]) => Array.isArray(contents) ? contents.length : 0
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record: DailySummary) => (
        <Button
          type="primary"
          onClick={() => handleSelectDailySummary(record)}
          loading={loading}
        >
          Seleccionar
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Seleccionar Resumen Diario</Title>}
      open={modalSelectDailySummary}
      onCancel={() => setModalSelectDailySummary(false)}
      footer={null}
      width={isMobile ? "95%" : 800}
      centered
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ marginBottom: 16 }}>
        <p>Selecciona el resumen diario al que quieres agregar el contenido:</p>
        {content && (
          <p><strong>Contenido:</strong> {content.title}</p>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={dailySummarys}
        rowKey="id"
        loading={tableLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} resúmenes diarios`
        }}
      />
    </Modal>
  );
};

export default SelectDailySummaryModal; 