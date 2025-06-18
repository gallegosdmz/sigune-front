"use client"

import type React from "react"

import { Row, Col } from "antd"
import { useEffect, useState } from "react"
import * as ContentUtils from "../../utils/ContentUtils"
import * as WeeklySummaryUtils from '../../utils/WeeklySummaryUtils';
import { Content } from "../../interfaces/Content"
import ListContents from "./ListContents"
import CreateContent from "./CreateContent"
import EditContent from "./EditContent"
import ListResumen from "../script/ListResumen"
import ListModalDaily from "./ListModalDaily"
import { DailySummary } from "../../interfaces/DailySummary"
import { WeeklySummary } from "../../interfaces/WeeklySummary"



const PanelContents: React.FC = () => {
  // STATES
  const [contents, setContents] = useState<Content[]>([])
  const [content, setContent] = useState<Content | null>(null);
  const [visibleAddNote, setVisibleAddNote] = useState<boolean>(false);
  const [visibleAddSection, setVisibleAddSection] = useState<boolean>(false);

  const [visibleViewNote, setVisibleViewNote] = useState<boolean>(false);
  const [visibleViewSection, setVisibleViewSection] = useState<boolean>(false);

  const [modalResumen, setModalResumen] = useState<boolean>(false);
  const [modalBitacora, setModalBitacora] = useState<boolean>(false);

  const [dailySummarys, setDailySummarys] = useState<DailySummary[]>([]);
  const [weeklySummarys, setWeeklySummarys] = useState<WeeklySummary[]>([]);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [file, setFile] = useState<any | null>(null);
  

  // Asignar Usuarios
  useEffect(() => {
    ContentUtils.handleSetContents(setContents);
    WeeklySummaryUtils.handleSetWeeklySummarys(setWeeklySummarys);
  }, [])

  return (
    <Row gutter={[16, 16]} className="mt-4">
      <Col xs={24}>
        
        <CreateContent
          script={null}
          setContents={setContents}
          setVisibleAddNote={setVisibleAddNote}
          setVisibleAddSection={setVisibleViewSection}
          visibleAddNote={visibleAddNote}
          visibleAddSection={visibleAddSection}
        />

        <EditContent
          content={content}
          script={null}
          file={file}
          setFile={setFile}
          setContents={setContents}
          setVisibleViewNote={setVisibleViewNote}
          setVisibleViewSection={setVisibleViewSection}
          visibleViewNote={visibleViewNote}
          visibleViewSection={visibleViewSection}
        />

        <ListContents
            contents={contents}
            setContent={setContent}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            setVisibleAddNote={setVisibleAddNote}
            setVisibleViewNote={setVisibleViewNote}
            setVisibleViewSection={setVisibleViewSection}
            setModalResumen={setModalResumen}
            setModalBitacora={setModalBitacora}
            setFile={setFile}
        />

        <ListResumen setModalResumen={setModalBitacora} modalResumen={modalBitacora} contents={contents} />
        <ListModalDaily setModalResumen={setModalResumen} modalResumen={modalResumen} contents={contents} setDailySummarys={setDailySummarys} weeklySummarys={weeklySummarys} />

      </Col>
    </Row>
  )
}

export default PanelContents;
