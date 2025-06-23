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

  const getLogoBuffer = async () => {
    const response = await fetch(
      "https://res.cloudinary.com/gallegos-dev/image/upload/v1747338557/Captura_de_pantalla_2025-05-15_134857_exjtsy.png",
    )
    const blob = await response.blob()
    return await blob.arrayBuffer()
  }

  const parseHtmlToDocxRuns = (html: string): Paragraph[] => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const paragraphs: Paragraph[] = [];

    wrapper.querySelectorAll("p").forEach(p => {
      const runs: TextRun[] = [];

      p.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          if (text.trim()) {
            runs.push(
              new TextRun({
                text,
                font: "Arial",
                size: 26,
              })
            );
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();

          if (tag === "br") {
            runs.push(new TextRun({ break: 1 }));
          } else {
            const text = el.textContent || "";
            if (text.trim()) {
              runs.push(
                new TextRun({
                  text,
                  bold: tag === "b" || tag === "strong",
                  italics: tag === "i" || tag === "em",
                  font: "Arial",
                  size: 26,
                })
              );
            }
          }
        }
      });

      if (runs.length > 0) {
        paragraphs.push(new Paragraph({ children: runs }));
      }
    });

    return paragraphs;
  };

  const exportToWord = async (data: TableItem[]) => {
    const logoBuffer = await getLogoBuffer()

    const image = new ImageRun({
      data: logoBuffer,
      transformation: {
        width: 500,
        height: 60,
      },
      type: "png", // Add the type property
    })

    const imageParagraph = new Paragraph({
      children: [image],
      alignment: "center", // opcional
      spacing: { after: 200 },
    })

    const title = new Paragraph({
      children: [
        new TextRun({
          text: `NOTAS ${getDateMx().toUpperCase()}`,
          bold: true,
          size: 26,
          font: 'Arial',
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
      alignment: AlignmentType.CENTER
    })

    const contentParagraphs = data.flatMap((item, index) => {
      const headerParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${item.type} - ${item.title}`,
            bold: true,
            break: 1,
            font: 'Arial',
            size: 26,
          }),
          new TextRun({
            text: `Fecha: ${new Date(item.createdAt!).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
            break: 1,
            font: 'Arial',
            size: 26,
          }),
        ],
        spacing: { after: 100 },
      });

      const contentParagraphs = parseHtmlToDocxRuns(item.textContent);

      return [headerParagraph, ...contentParagraphs];
    });

    // Firma al final del documento (alineada y centrada como en el ejemplo)
    const signatureLine = new Paragraph({
      children: [
        new TextRun({
          text: "_____________________________________",
          font: "Arial",
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 100 },
    });

    const signatureName = new Paragraph({
      children: [
        new TextRun({
          text: "Lic. Martha Gabriela Yeverino Sifuentes",
          font: "Arial",
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
    });

    const signaturePosition = new Paragraph({
      children: [
        new TextRun({
          text: "Jefa del Departamento de Noticias",
          font: "Arial",
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
    });


    const doc = new Document({
      creator: "SIGUNE",
      title: `Notas ${getDateMx()}`,
      description: "Exportación de contenidos",
      sections: [
        {
          headers: {
            default: new Header({
              children: [imageParagraph],
            }),
          },
          children: [title, ...contentParagraphs, signatureLine, signatureName, signaturePosition],
        },
      ],
    })

    message.success('Bitacora exportado correctamente');

    const blob = await Packer.toBlob(doc)
    saveAs(blob, "BITACORA.docx")
  }

  const handleExport = async () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.key));
    exportToWord(selectedItems);

    message.success(`Exportados ${selectedItems.length} elementos.`);
    setModalResumen(false);
  };

  return (
    <Modal
      title={<Title level={4}>Generar Bitacora</Title>}
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
