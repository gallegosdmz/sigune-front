"use client"

import React, { useEffect, useState } from "react"
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
  const [visibleViewNote, setVisibleViewNote] = useState<boolean>(false)
  const [visibleViewSection, setVisibleViewSection] = useState<boolean>(false)
  const [modalResumen, setModalResumen] = useState<boolean>(false)

  const [showListExternal, setShowListExternal] = useState(false)

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
      "https://res.cloudinary.com/gallegos-dev/image/upload/v1746470082/Logo_Actualizado_010425_rx8gyh.png",
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

  const stripHtml = (html: string): string => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
  };

  const exportToWord = async () => {
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

    const contentParagraphs = data.map((item, index) => {
      if (item.type === 'Sección') {
        return new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${item.type} - ${item.title}`,
              bold: true,
              break: 1,
              font: 'Arial',
              size: 26,
            }),
          ],
          spacing: { after: 200 },
        })

      } else {
        return new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${item.type} - ${item.title}`,
              bold: true,
              break: 1,
              font: 'Arial',
              size: 26,
            }),
            new TextRun({
              text: `Autor: ${
                typeof item.user === "object" && item.user !== null
                  ? `${item.user.name} ${item.user.surname}`
                  : "Desconocido"
              }`,
              italics: true,
              break: 1,
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
            new TextRun({
              text: stripHtml(item.textContent),
              break: 2,
              font: 'Arial',
              size: 26,
            }),
          ],
          spacing: { after: 200 },
        })

      }
      
    })

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
          children: [title, ...contentParagraphs],
        },
      ],
    })

    message.success('Guión exportado correctamente');

    const blob = await Packer.toBlob(doc)
    saveAs(blob, "GUION_NOTICIAS.docx")
  }

  const columns: ColumnsType<Content> = [
    {
      title: "Posición",
      dataIndex: "position",
      key: "position",
      width: 60,
      className: "drag-visible",
      render: () => <MenuOutlined style={{ cursor: "grab", color: "#999" }} />,
    },
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
  ]

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "1") {
      setVisibleAddNote(true)
    } else if (e.key === "2") {
      setVisibleAddSection(true)
    } else if (e.key === "3") {
      setShowListExternal(true)
    } else if (e.key === "4") {
      setModalResumen(true)
    } else if (e.key === "5") {
      exportToWord()
    }
  }

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Nota",
      onClick: handleMenuClick,
    },
    {
      key: "2",
      label: "Sección",
      onClick: handleMenuClick,
    },
    {
      key: "3",
      label: "Externos",
      onClick: handleMenuClick,
    },
    {
      key: "4",
      label: "Resumen",
      onClick: handleMenuClick,
    },
    {
      key: "5",
      label: "Exportar",
      onClick: handleMenuClick,
    },
  ]

  return (
    <>
      {!showListExternal ? (
        <div className="p-4">
          <Card
            title="Guión"
            extra={
              <Dropdown menu={{ items }} trigger={["click"]} onOpenChange={(open) => setDropdownOpen(open)}>
                {localStorage.getItem("typeUser") === "admin_user" ? (
                  <Button type="primary">
                    <DownOutlined
                      className={css`
                      transition: transform 0.3s ease;
                      transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                    `}
                    />
                    Agregar Contenido{" "}
                  </Button>
                ) : (
                  <></>
                )}
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
                    onClick: () => {}, // Manejador vacío para satisfacer el tipo
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
            visibleAddNote={visibleAddNote}
            visibleAddSection={visibleAddSection}
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
