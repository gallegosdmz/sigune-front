"use client"

import type React from "react"

import { Button, message, Modal, Typography } from "antd"
import { useIsMobile } from "../../hooks/use-media-query"
import { useEffect, useState } from "react"
import Table, { ColumnsType } from "antd/es/table"
import { Script } from "../../interfaces/Script"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header } from "docx"
import { saveAs } from "file-saver"
import { Content } from "../../interfaces/Content"

type Props = {
  setModalResumen: (modalResumen: boolean) => void,
  modalResumen: boolean,
  scripts: Script[]
}

type TableItem = {
  key: number;
  title: string;
  dateEmission: Date;
  contents: Content[];
}

const { Title } = Typography

const ListResumenSemanal: React.FC<Props> = ({ setModalResumen, modalResumen, scripts }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<Script[]>([]);

  useEffect(() => {
    console.log(data);
    setData(scripts);

  }, [modalResumen]);

  const isMobile = useIsMobile();


  const dataSource: TableItem[] = data.map((item, index) => ({
    key: Number(item.id ?? index),
    title: item.title,
    dateEmission: item.dateEmission,
    contents: item.contents!,
  })) || [];

  const columns: ColumnsType<TableItem> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
    },
    {
      title: 'Fecha de Emisión',
      dataIndex: 'dateEmission',
      key: 'dateEmission',
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
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

    // Función para procesar nodos recursivamente
    const processNode = (node: Node, parentTag?: string): (TextRun | 'BREAK')[] => {
      const runs: (TextRun | 'BREAK')[] = [];

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (text.trim()) {
          runs.push(
            new TextRun({
              text: text,
              font: "Arial",
              size: 26,
              bold: parentTag === "b" || parentTag === "strong",
              italics: parentTag === "i" || parentTag === "em",
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (tag === "br") {
          runs.push('BREAK');
        } else if (tag === "p" || tag === "div") {
          // Procesar contenido del párrafo/div
          el.childNodes.forEach(childNode => {
            runs.push(...processNode(childNode, tag));
          });
          // Agregar salto de línea después del párrafo
          runs.push('BREAK');
        } else {
          // Procesar elementos inline (span, strong, b, i, em, etc.)
          el.childNodes.forEach(childNode => {
            runs.push(...processNode(childNode, tag));
          });
        }
      }

      return runs;
    };

    // Procesar todo el contenido del wrapper
    const allRuns: (TextRun | 'BREAK')[] = [];
    wrapper.childNodes.forEach(node => {
      allRuns.push(...processNode(node));
    });

    // Dividir en párrafos basándose en los saltos de línea
    let currentParagraphRuns: TextRun[] = [];
    
    allRuns.forEach((item, index) => {
      if (item === 'BREAK') {
        // Si hay contenido en el párrafo actual, crear el párrafo
        if (currentParagraphRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: currentParagraphRuns,
              spacing: { after: 100, line: 276 } // 1.15 line spacing
            })
          );
          currentParagraphRuns = [];
        }
      } else {
        currentParagraphRuns.push(item);
      }
    });

    // Agregar el último párrafo si hay contenido
    if (currentParagraphRuns.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: currentParagraphRuns,
          spacing: { after: 100, line: 276 } // 1.15 line spacing
        })
      );
    }

    // Si no se generaron párrafos, crear uno con el texto plano
    if (paragraphs.length === 0) {
      const text = wrapper.textContent || html;
      if (text.trim()) {
        // Preservar saltos de línea del texto original
        const lines = text.split(/\n/);
        lines.forEach(line => {
          if (line.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    font: "Arial",
                    size: 26,
                  }),
                ],
                spacing: { after: 100, line: 276 }, // 1.15 line spacing
              })
            );
          }
        });
      }
    }

    return paragraphs;
  };

  const exportToWord = async (data: any[]) => {
    const lastDay = data[0].dateEmission ? new Date(data[0].dateEmission).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
      : "Fecha no disponible";

    const firstDay = data.length > 0
      ? data[data.length - 1].dateEmission
      : null;

    const fDayParsed = firstDay ? new Date(firstDay).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
      : "Fecha no disponible";

    const logoBuffer = await getLogoBuffer()

    const image = new ImageRun({
      data: logoBuffer,
      transformation: {
        width: 500,
        height: 65,
      },
      type: "png",
    })

    const imageParagraph = new Paragraph({
      children: [image],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })

    const title = new Paragraph({
      children: [
        new TextRun({
          text: `RESUMEN SEMANAL DEL ${lastDay.toUpperCase()} al ${fDayParsed.toUpperCase()}`,
          bold: true,
          size: 32,
          font: 'Arial',
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
      alignment: AlignmentType.CENTER,
    })

    const allContent: Paragraph[] = []

    data.forEach((guion, gIndex) => {
      console.log(guion);
      // Título del guión
      allContent.push(new Paragraph({
        children: [
          new TextRun({
            text: `GUION ${gIndex + 1}: ${guion.title}`,
            bold: true,
            size: 28,
            font: 'Arial',
          }),
          new TextRun({
            text: ` - ${new Date(guion.dateEmission).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
            italics: true,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }))

      guion.contents.forEach((item: any, index: number) => {
        const headerParagraph = new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${item.type} - ${item.title}`,
              bold: true,
              break: 1,
              font: 'Arial',
              size: 26,
            }),
          ],
          spacing: { after: 100 },
        });

        const contentParagraphs = parseHtmlToDocxRuns(item.textContent);
        allContent.push(headerParagraph, ...contentParagraphs);
      });
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
      title: `RESUMEN SEMANAL DEL ${lastDay.toUpperCase()} al ${fDayParsed.toUpperCase()}`,
      description: "Exportación de contenidos",
      sections: [
        {
          headers: {
            default: new Header({
              children: [imageParagraph],
            }),
          },
          children: [title, ...allContent, signatureLine, signatureName, signaturePosition],
        },
      ],
    })

    message.success('Guiones exportados correctamente')

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `RESUMEN SEMANAL DEL ${lastDay.toUpperCase()} al ${fDayParsed.toUpperCase()}.docx`)
  }


  const handleExport = async () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.key));
    exportToWord(selectedItems);

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

export default ListResumenSemanal;
