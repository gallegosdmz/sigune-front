"use client"

import React, { useEffect, useState, useRef } from "react"
import { Table, Button, Card, type MenuProps, Dropdown, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DownOutlined, EyeOutlined, MenuOutlined } from "@ant-design/icons"
import { css } from "@emotion/css"
import type { Content } from "../../interfaces/Content"
import * as ContentUtils from "../../utils/ContentUtils"
import { useParams } from "react-router-dom"
import type { User } from "../../interfaces/User"
import CreateContent from "./CreateContent"
import EditContent from "./EditContent"
import ListExternalContents from "./ListExternalContents"
import ListResumen from "./ListResumen"
import ExportConfigModal, { ExportConfig } from "./ExportConfigModal"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, Header } from "docx"
import { saveAs } from "file-saver"

// Define the drag type
const type = "DraggableRow"

// Draggable row component
interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number
  moveRow: (dragIndex: number, hoverIndex: number) => void
}

const DraggableRow = ({ index, moveRow, className, style, ...restProps }: DraggableRowProps) => {
  const ref = React.useRef<HTMLTableRowElement>(null)

  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {}
      if (dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? "drop-over-downward" : "drop-over-upward",
      }
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index)
    },
  })

  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drop(drag(ref))

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? ` ${dropClassName}` : ""}`}
      style={{ cursor: "move", ...style }}
      {...restProps}
    />
  )
}

// Main component
const ListScript: React.FC = () => {
  const [data, setData] = useState<Content[]>([]) // setContents
  const [content, setContent] = useState<Content | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [file, setFile] = useState<any | null>(null)

  const [visibleAddNote, setVisibleAddNote] = useState<boolean>(false)
  const [visibleAddSection, setVisibleAddSection] = useState<boolean>(false)
  const [visibleAddAdvance, setVisibleAddAdvance] = useState<boolean>(false)
  const [visibleViewNote, setVisibleViewNote] = useState<boolean>(false)
  const [visibleViewSection, setVisibleViewSection] = useState<boolean>(false)
  const [modalResumen, setModalResumen] = useState<boolean>(false)

  const [showListExternal, setShowListExternal] = useState(false)
  const [exportConfigModalVisible, setExportConfigModalVisible] = useState<boolean>(false)

  const { idScript } = useParams<{ idScript: string }>() // PONER COMO PARAMETRO EN SET DE SCRIPTS

  useEffect(() => {
    ContentUtils.handleSetContentsWithScriptApproved(Number(idScript), setData)
  }, [showListExternal])

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const dragRow = data[dragIndex] // Se obtiene la fila que se moverá

    const hoverRow = data[hoverIndex]

    const newData = [...data] // Se crea una copia del array de contents

    newData.splice(dragIndex, 1) // Se elimina la fila en su posición original
    newData.splice(hoverIndex, 0, { ...dragRow, position: hoverIndex }) // Se inserta la fila en la nueva posición

    // Update indices for all rows <- AQUI ESTÁ EL PROBLEMA
    newData.forEach((item, index) => {
      item.position = index
    })

    const contentsModify = [dragRow, hoverRow]

    ContentUtils.handleChangePosition(contentsModify, dragIndex, hoverIndex)
    setData(newData)
  }

  const getLogoBuffer = async () => {
    const response = await fetch(
      "https://res.cloudinary.com/gallegos-dev/image/upload/v1747338557/Captura_de_pantalla_2025-05-15_134857_exjtsy.png",
    )
    const blob = await response.blob()
    return await blob.arrayBuffer()
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
              spacing: { after: 100, line: 276 } // 1.15 line spacing (24pt * 1.15 = 27.6pt = 276 twips)
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

  const exportToWord = async (exportConfig?: ExportConfig) => {
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
          text: "GUION NOTICIAS 14:00 HORAS",
          bold: true,
          size: 26,
          font: 'Arial',
        }),
        new TextRun({
          text: "PUNTO DE ENCUENTRO",
          bold: true,
          size: 26,
          font: 'Arial',
          break: 1
        }),
        new TextRun({
          text: getDateMx().toUpperCase(),
          bold: true,
          size: 26,
          font: 'Arial',
          break: 1
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
      alignment: AlignmentType.CENTER
    })

    const contentParagraphs = data.flatMap((item, index) => {
      const paragraphs: Paragraph[] = [];
      
      // Solo incluir campos según la configuración
      const config = exportConfig?.[item.id!] || { title: true, head: true, textContent: true };
      
      // Incluir título si está seleccionado
      if (config.title) {
        const headerParagraph = new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}.- ${item.title}`,
              bold: true,
              break: 1,
              font: 'Arial',
              size: 26,
            }),
          ],
          spacing: { after: 100 },
        });
        paragraphs.push(headerParagraph);
      }
      
      // Incluir cabeza si está seleccionada
      if (config.head) {
        const headParagraph = new Paragraph({
          children: [
            new TextRun({
              text: item.head,
              bold: true,
              font: 'Arial',
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        });
        paragraphs.push(headParagraph);
      }
      
      // Incluir contenido si está seleccionado
      if (config.textContent) {
        const contentParagraphs = parseHtmlToDocxRuns(item.textContent);
        paragraphs.push(...contentParagraphs);
      }

      return paragraphs;
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
      title: "Guion Noticias",
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

    message.success('Guión exportado correctamente');

    const blob = await Packer.toBlob(doc)
    saveAs(blob, "GUION_NOTICIAS.docx")
  }

  const handleExportWithConfig = (config: ExportConfig) => {
    setExportConfigModalVisible(false);
    exportToWord(config);
  };

  const typeUser = localStorage.getItem("typeUser");

  const columns: ColumnsType<Content> = [
    ...(typeUser === "admin_user"
      ? [
        {
          title: "Posición",
          dataIndex: "position",
          key: "position",
          width: 60,
          className: "drag-visible",
          render: () => <MenuOutlined style={{ cursor: "grab", color: "#999" }} />,
        },
      ]
      : []),

    {
      title: "Titulo",
      dataIndex: "title",
      key: "title",
      render: (_, record) => `${record.position! + 1}. ${record.type} - ${record.title}`,
    },
    {
      title: "Usuario",
      dataIndex: "user",
      key: "user",
      render: (record: User) => `${record.name} ${record.surname}`,
    },
    {
      title: "Fecha de Creado",
      dataIndex: "createdAt",
      key: "createdAt",
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
      title: "Acciones",
      key: "actions",
      render: (_, record: Content) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() =>
            ContentUtils.handleModalView(
              record,
              setContent,
              setFile,
              record.type === "Nota" ? setVisibleViewNote : setVisibleViewSection,
            )
          }
        >
          Ver
        </Button>
      ),
    },
  ];


  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "1") {
      setVisibleAddNote(true)
    } else if (e.key === "2") {
      setVisibleAddSection(true)
    } else if (e.key === "3") {
      setVisibleAddAdvance(true)
    } else if (e.key === "4") {
      setShowListExternal(true)
    } else if (e.key === "5") {
      setModalResumen(true)
    } else if (e.key === "6") {
      setExportConfigModalVisible(true)
    }
  }

  let items: MenuProps["items"];

  if (localStorage.getItem("typeUser") === "admin_user") {
    items = [
      {
        key: "1",
        label: "Agregar Nota",
        onClick: handleMenuClick,
      },
      {
        key: "2",
        label: "Agregar Sección",
        onClick: handleMenuClick,
      },
      {
        key: "3",
        label: "Agregar Avance",
        onClick: handleMenuClick,
      },
      {
        key: "4",
        label: "Ver Externos",
        onClick: handleMenuClick,
      },
      {
        key: "5",
        label: "Resumen",
        onClick: handleMenuClick,
      },
      {
        key: "6",
        label: "Exportar",
        onClick: handleMenuClick,
      },
    ]
  } else if (localStorage.getItem('typeUser') === 'editor_user') {
    items = [
      {
        key: "6",
        label: "Exportar",
        onClick: handleMenuClick,
      },
    ]
  }



  return (
    <>
      {!showListExternal ? (
        <div className="p-4">
          <Card
            title="Guión"
            extra={
              <Dropdown menu={{ items }} trigger={["click"]} onOpenChange={(open) => setDropdownOpen(open)}>
                <Button type="primary">
                  <DownOutlined
                    className={css`
                      transition: transform 0.3s ease;
                      transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                    `}
                  />
                  Seleccionar Opciones{" "}
                </Button>
              </Dropdown>
            }
          >
            <DndProvider backend={HTML5Backend}>
              <Table
                columns={columns}
                dataSource={data}
                rowKey="key"
                pagination={false}
                components={{
                  body: {
                    row: DraggableRow,
                  },
                }}
                onRow={(record, index) => {
                  console.log(record.title)
                  return {
                    index: index as number,
                    moveRow,
                    // Añadimos un manejador de eventos para cumplir con el tipo esperado
                    onClick: () => { }, // Manejador vacío para satisfacer el tipo
                  } as React.HTMLAttributes<HTMLElement> & {
                    index: number
                    moveRow: (dragIndex: number, hoverIndex: number) => void
                  }
                }}
                className={css`
                    .drop-over-downward {
                    border-bottom: 2px dashed #1890ff;
                    }
                    .drop-over-upward {
                    border-top: 2px dashed #1890ff;
                    }
                `}
              />
            </DndProvider>
          </Card>
          <CreateContent
            script={Number(idScript)} // PASAR IDSCRIPT
            setContents={setData}
            setVisibleAddNote={setVisibleAddNote}
            setVisibleAddSection={setVisibleAddSection}
            setVisibleAddAdvance={setVisibleAddAdvance}
            visibleAddNote={visibleAddNote}
            visibleAddSection={visibleAddSection}
            visibleAddAdvance={visibleAddAdvance}
          />

          <EditContent
            content={content}
            script={Number(idScript)} // cambiarlo por idScript
            file={file}
            setFile={setFile}
            setContents={setData}
            setVisibleViewNote={setVisibleViewNote}
            setVisibleViewSection={setVisibleViewSection}
            visibleViewNote={visibleViewNote}
            visibleViewSection={visibleViewSection}
          />

          <ListResumen setModalResumen={setModalResumen} modalResumen={modalResumen} contents={data} />
          
          <ExportConfigModal
            visible={exportConfigModalVisible}
            onCancel={() => setExportConfigModalVisible(false)}
            onExport={handleExportWithConfig}
            contents={data}
          />
        </div>
      ) : (
        <ListExternalContents
          setShowListExternal={setShowListExternal}
          setVisibleViewNote={setVisibleViewNote}
          setVisibleViewSection={setVisibleViewSection}
          setFile={setFile}
          file={file}
          visibleViewNote={visibleViewNote}
          visibleViewSection={visibleViewSection}
        />
      )}
    </>
  )
}

export default ListScript
