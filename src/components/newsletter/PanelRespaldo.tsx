"use client"

import type React from "react"

import { Row, Col } from "antd"
import ListRespaldo from "./ListRespaldo"

const PanelRespaldo: React.FC = () => {
  
  return (
    <Row gutter={[16, 16]} className="mt-4">
      <Col xs={24}>
        <ListRespaldo/>
      </Col>
    </Row>
  )
}

export default PanelRespaldo
