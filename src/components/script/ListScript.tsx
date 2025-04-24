import React, { useEffect, useState } from "react"
import { Table, Button, Card, MenuProps, Dropdown } from "antd"
import type { ColumnsType } from "antd/es/table"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DownOutlined, EyeOutlined, MenuOutlined } from "@ant-design/icons"
import { css } from "@emotion/css"
import { Content } from "../../interfaces/Content"
import * as ContentUtils from '../../utils/ContentUtils';
import { useParams } from "react-router-dom"
import { User } from "../../interfaces/User"
import CreateContent from "./CreateContent"
import EditContent from "./EditContent"
import ListExternalContents from "./ListExternalContents"


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
  const [data, setData] = useState<Content[]>([]); // setContents
  const [ content, setContent ] = useState<Content | null>( null );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ file, setFile ] = useState<any | null>( null );

  const [ visibleAddNote, setVisibleAddNote ] = useState<boolean>( false );
  const [ visibleAddSection, setVisibleAddSection ] = useState<boolean>( false );
  const [ visibleViewNote, setVisibleViewNote ] = useState<boolean>( false );
  const [ visibleViewSection, setVisibleViewSection ] = useState<boolean>( false );

  const [showListExternal, setShowListExternal] = useState(false);

  const { idScript } = useParams<{ idScript: string }>(); // PONER COMO PARAMETRO EN SET DE SCRIPTS

  useEffect(() => {
    ContentUtils.handleSetContentsWithScriptApproved( Number( idScript ), setData )
  }, [ showListExternal ]);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    
    const dragRow = data[dragIndex]; // Se obtiene la fila que se moverá
    
    const hoverRow = data[hoverIndex];

    
    const newData = [...data]; // Se crea una copia del array de contents
    
    newData.splice(dragIndex, 1); // Se elimina la fila en su posición original
    newData.splice(hoverIndex, 0, { ...dragRow, position: hoverIndex }); // Se inserta la fila en la nueva posición

    // Update indices for all rows <- AQUI ESTÁ EL PROBLEMA
    newData.forEach((item, index) => {
      item.position = index;
    })
    

    const contentsModify = [ dragRow, hoverRow ];

    ContentUtils.handleChangePosition( contentsModify, dragIndex, hoverIndex );
    setData(newData);
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
          onClick={() => ContentUtils.handleModalView( record, setContent, setFile, record.type === 'Nota' ? setVisibleViewNote : setVisibleViewSection )}
        >
          Ver
        </Button>
      ),
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === "1") {
      setVisibleAddNote( true );

    } else if (e.key === "2") {
      setVisibleAddSection( true );
    } else if (e.key === "3") {
      setShowListExternal(true);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Nota",
      onClick: handleMenuClick
    },
    {
      key: "2",
      label: "Sección",
      onClick: handleMenuClick
    },
    {
      key: "3",
      label: "Externos",
      onClick: handleMenuClick
    }
  ];

  return (
    <>
      {!showListExternal ? (
        <div className="p-4">
          <Card
            title="Guión"
            extra={
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                onOpenChange={(open) => setDropdownOpen(open)}
              >
                <Button
                  type="primary"
                >
                  <DownOutlined
                    className={css`
                      transition: transform 0.3s ease;
                      transform: rotate(${dropdownOpen ? "180deg" : "0deg"});
                    `}
                  />
                  Agregar Contenido{" "}
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
          script={Number( idScript )} // PASAR IDSCRIPT
          setContents={setData}
          setVisibleAddNote={setVisibleAddNote}
          setVisibleAddSection={setVisibleAddSection}
          visibleAddNote={visibleAddNote}
          visibleAddSection={visibleAddSection}
        />

        <EditContent
          content={content}
          script={Number( idScript )} // cambiarlo por idScript
          file={file}
          setContents={setData}
          setVisibleViewNote={setVisibleViewNote}
          setVisibleViewSection={setVisibleViewSection}
          visibleViewNote={visibleViewNote}
          visibleViewSection={visibleViewSection}
        />
      </div>
      ) : (
        <ListExternalContents
          setShowListExternal={ setShowListExternal }
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

