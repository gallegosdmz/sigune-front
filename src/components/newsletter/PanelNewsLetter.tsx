"use client"

import type React from "react"

import { Row, Col, Form } from "antd"
import { useEffect, useState } from "react"
import type { NewsLetter } from "../../interfaces/NewsLetter"
import * as NewsLetterUtils from "../../utils/NewsLetterUtils"
import ListNewLetters from "./ListNewsLetters"
import ListNewsLetter from "./ListNewsLetter"
import CreateNewsLetter from "./CreateNewsLetter"
import EditNewsLetter from "./EditNewsLetter"

const PanelNewsLetter: React.FC = () => {
  // STATES
  const [newsLetters, setNewsLetters] = useState<NewsLetter[]>([])
  const [visibleAdd, setVisibleAdd] = useState<boolean>(false)
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false)

  const [newsLetter, setNewsLetter] = useState<NewsLetter | null>(null)
  const [modalView, setModalView] = useState<boolean>(false)

  // FORMS
  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()

  // Asignar Usuarios
  useEffect(() => {
    NewsLetterUtils.handleSetNewsLetters(setNewsLetters)
  }, [])

  return (
    <Row gutter={[16, 16]} className="mt-4">
      <Col xs={24}>
        <CreateNewsLetter
            setNewsLetters={setNewsLetters}
            setVisibleAdd={setVisibleAdd}
            visibleAdd={visibleAdd}
            addForm={addForm}
        />

        <EditNewsLetter
            newsLetter={newsLetter}
            setNewsLetters={setNewsLetters}
            setVisibleEdit={setVisibleEdit}
            visibleEdit={visibleEdit}
            editForm={editForm}
        />

        <ListNewLetters
            newsLetters={newsLetters}
            setVisibleAdd={setVisibleAdd}
            setVisibleEdit={setVisibleEdit}
            setNewsLetter={setNewsLetter}
            setNewsLetters={setNewsLetters}
            setModalView={setModalView}
            editForm={editForm}
        />

        <ListNewsLetter
            newsLetter={newsLetter}
            modalView={modalView}
            setModalView={setModalView}
        />
      </Col>
    </Row>
  )
}

export default PanelNewsLetter
