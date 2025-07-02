"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Button, message, Modal, Typography, Radio, DatePicker } from "antd"
import Table, { ColumnsType } from "antd/es/table"
import { useIsMobile } from "../../hooks/use-media-query"
import { Content } from "../../interfaces/Content"
import { Script } from "../../interfaces/Script"
import { User } from "../../interfaces/User"
import { DailySummary } from "../../interfaces/DailySummary"
import { WeeklySummary } from "../../interfaces/WeeklySummary"
import * as DailySummaryUtils from '../../utils/DailySummaryUtils'
import * as WeeklySummaryUtils from '../../utils/WeeklySummaryUtils'

type Props = {
  setModalResumen: (modalResumen: boolean) => void,
  modalResumen: boolean,
  contents: Content[],
  setDailySummarys: (dailySummarys: (prev: DailySummary[]) => DailySummary[]) => void,
  weeklySummarys: WeeklySummary[],
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

const ListModalDaily: React.FC<Props> = ({ setModalResumen, modalResumen, contents, setDailySummarys, weeklySummarys }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<Content[]>([]);

  const [selectResumenModalOpen, setSelectResumenModalOpen] = useState(false);
  const [selectedResumenId, setSelectedResumenId] = useState<number | "new" | null>(null);
  const [newResumenDate, setNewResumenDate] = useState<Date | null>(null);
  const [newResumenId, setNewResumenId] = useState<number | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    const filter = contents.filter(content => content.type !== 'Sección');
    setData(filter);
  }, [modalResumen]);

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
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  };

  const openResumenSelection = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Debes seleccionar al menos un contenido.");
      return;
    }
    setSelectResumenModalOpen(true);
  };

  const confirmExport = async () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.key));

    if (selectedResumenId === "new") {
      if (!newResumenDate) {
        message.error("Selecciona una fecha para el nuevo resumen.");
        return;
      }

      try {
        const weeklySummary = await WeeklySummaryUtils.handleAddSave(newResumenDate);
        if (!weeklySummary || !weeklySummary.id) {
          message.error("Error al crear el resumen semanal.");
          return;
        }
        
        await DailySummaryUtils.handleAddSave(selectedItems, setDailySummarys, setModalResumen, weeklySummary.id);
        message.success(`Resumen creado y ${selectedItems.length} elementos exportados.`);
      } catch (error) {
        message.error("Error al crear el resumen.");
        return;
      }
    } else if (selectedResumenId !== null) {
      await DailySummaryUtils.handleAddSave(selectedItems, setDailySummarys, setModalResumen, selectedResumenId);
      message.success(`Exportados ${selectedItems.length} elementos al resumen seleccionado.`);
    } else {
      message.error("Selecciona un resumen para exportar.");
      return;
    }

    setSelectResumenModalOpen(false);
    setModalResumen(false);
  };

  return (
    <>
      <Modal
        title={<Title level={4}>Generar Resumen Diario</Title>}
        open={modalResumen}
        onCancel={() => setModalResumen(false)}
        footer={[]}
        width={isMobile ? "95%" : 600}
        centered
        bodyStyle={{ padding: 16 }}
      >
        <Table
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 5,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} elementos`,
            size: 'default'
          }}
          size="small"
        />

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button
            type="primary"
            onClick={openResumenSelection}
            disabled={selectedRowKeys.length === 0}
          >
            Exportar Seleccionados
          </Button>
        </div>
      </Modal>

      <Modal
        title="Selecciona un resumen"
        open={selectResumenModalOpen}
        onCancel={() => setSelectResumenModalOpen(false)}
        onOk={confirmExport}
        okText="Exportar"
        cancelText="Cancelar"
        width={isMobile ? "95%" : 500}
      >
        <Radio.Group
          onChange={(e) => {
            setSelectedResumenId(e.target.value);
            if (e.target.value !== "new") {
              setNewResumenDate(null);
            }
          }}
          value={selectedResumenId}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <Radio value="new">Crear nuevo resumen semanal</Radio>

          <div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
            {weeklySummarys.length > 0 ? (
              weeklySummarys.map((resumen) => (
                <Radio key={resumen.id} value={resumen.id}>
                  {new Date(resumen.date).toLocaleDateString("es-MX")}
                </Radio>
              ))
            ) : (
              <p>No hay resúmenes disponibles.</p>
            )}
          </div>
        </Radio.Group>

        {selectedResumenId === "new" && (
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Selecciona la fecha del resumen:
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={newResumenDate}
              onChange={setNewResumenDate}
              format="DD/MM/YYYY"
            />
          </div>
        )}
      </Modal>

    </>
  )
}

export default ListModalDaily;
