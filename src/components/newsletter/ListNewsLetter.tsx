"use client"

import type React from "react"

import { Modal, Typography, Descriptions } from "antd"
import type { NewsLetter } from "../../interfaces/NewsLetter"
import { useIsMobile } from "../../hooks/use-media-query"

type Props = {
  newsLetter: NewsLetter | null
  modalView: boolean
  setModalView: (modalView: boolean) => void
}

const { Title } = Typography

const ListNewsLetter: React.FC<Props> = ({ newsLetter, modalView, setModalView }) => {
  const isMobile = useIsMobile()


  return (
    <Modal
      title={<Title level={4}>Detalles del Boletín</Title>}
      open={modalView}
      onCancel={() => setModalView(false)}
      footer={[]}
      width={isMobile ? "95%" : 600}
      centered
      bodyStyle={{ padding: 16 }} // padding personalizado
    >
      {newsLetter && (
        <Descriptions layout={isMobile ? "vertical" : "horizontal"} column={isMobile ? 1 : 1} bordered>
          <Descriptions.Item label="Clasificación">{newsLetter.dependence}</Descriptions.Item>
          
          {/* Campo con scroll */}
          <Descriptions.Item
            label="Contenido"
            span={2} // para que ocupe el ancho completo
          >
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {newsLetter.textContent}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Fecha de Emisión">
            {new Date(newsLetter.createdAt!).toLocaleDateString("es-ES")}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}

export default ListNewsLetter
