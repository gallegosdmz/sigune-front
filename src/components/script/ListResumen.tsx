"use client"

import type React from "react"

import { Button, message, Modal, Typography } from "antd"
import { useIsMobile } from "../../hooks/use-media-query"
import { Content } from "../../interfaces/Content"
import { useEffect, useState } from "react"
import { User } from "../../interfaces/User"
import Table, { ColumnsType } from "antd/es/table"
import { Script } from "../../interfaces/Script"
import pdfMake from "pdfmake/build/pdfmake"

type Props = {
  setModalResumen: (modalResumen: boolean) => void,
  modalResumen: boolean,
  contents: Content[],
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
}

const { Title } = Typography

const ListResumen: React.FC<Props> = ({setModalResumen, modalResumen, contents}) => {
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
  })) || [];

  const columns: ColumnsType<TableItem> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Usuario",
      dataIndex: "user",
      key: "user",
      render: (user?: User) => user ? `${user.name} ${user.surname}` : "Sin usuario",
    },
  ]

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const getDateMx = () => {
    const date = new Date();
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia} de ${mes} del ${año}`;
  }

  const generateReportPDF = (
    contents: TableItem[],
    logoBase64: string
  ) => {
    const docDefinition: any = {
      content: [
        { image: 'logo', width: 500, alignment: 'center', margin: [0, 0, 0, 20] },
        { text: 'RESUMEN DIARIO', style: 'header' },
        { text: `${getDateMx()}`, style: 'header' },
        { text: '\n\n' },
        ...contents.map((item, index) => ([
          { text: `${index + 1}.${item.type}: ${item.title.toUpperCase()}`, style: 'noteTitle', margin: [0, 10, 0, 4] },
          { text: `${stripHtml(item.textContent)}`, style: 'body', margin: [0, 0, 0, 4] },
          item.user ? { text: `${item.user.name} ${item.user.surname}`, style: 'author', margin: [0, 0, 0, 10] } : {},
          { text: '\n' }
        ])).flat()
      ],
      images: {
        logo: logoBase64
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center'
        },
        noteTitle: {
          fontSize: 14,
          bold: true
        },
        voice: {
          italics: true,
          margin: [0, 0, 0, 2]
        },
        body: {
          fontSize: 11,
          lineHeight: 1.3
        },
        author: {
          alignment: 'right',
          italics: true,
          fontSize: 10
        }
      }
    };
  
    pdfMake.createPdf(docDefinition).download("resumen-semanal.pdf");
  };
  
    

  const handleExport = async () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.key));
    const logoBase64 = await getBase64ImageFromUrl("https://res.cloudinary.com/gallegos-dev/image/upload/v1746470082/Logo_Actualizado_010425_rx8gyh.png");
  
    generateReportPDF(selectedItems, logoBase64);
    message.success(`Exportados ${selectedItems.length} elementos.`);
    setModalResumen(false);
  };

  return (
    <Modal
      title={<Title level={4}>Generar Resumen</Title>}
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
