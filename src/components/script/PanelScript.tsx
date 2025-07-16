import { Col, Form, Row } from "antd";
import { useEffect, useState } from "react";
import { Script } from "../../interfaces/Script";
import * as ScriptUtils from '../../utils/ScriptUtils';
import ListScripts from "./ListScripts";
import CreateScript from "./CreateScript";
import EditScript from "./EditScript";

const PanelScript: React.FC = () => {
    // STATES
    const [ scripts, setScripts ] = useState<Script[]>([]);
    const [ script, setScript ] = useState<Script | null>( null );

    const [ visibleAdd, setVisibleAdd ] = useState<boolean>( false );
    const [ visibleEdit, setVisibleEdit ] = useState<boolean>( false );

    const [modalResumen, setModalResumen] = useState<boolean>(false);
    
    // FORMS
    const [ addForm ] = Form.useForm();
    const [ editForm ] = Form.useForm();

    useEffect(() => {
      ScriptUtils.handleSetScripts( setScripts );
    }, []); // Array de dependencias vacío para que solo se ejecute una vez

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <CreateScript
              addForm={ addForm }
              setScripts={ setScripts }
              setVisibleAdd={ setVisibleAdd }
              visibleAdd={ visibleAdd }
            />

            <EditScript
              script={ script }
              setScripts={ setScripts }
              setVisibleEdit={ setVisibleEdit }
              visibleEdit={ visibleEdit }
              editForm={ editForm }
            />

            <ListScripts
              scripts={ scripts }
              setVisibleAdd={ setVisibleAdd }
              setVisibleEdit={ setVisibleEdit }
              setScript={ setScript }
              setScripts={ setScripts }
              setModalResumen={setModalResumen}
              modalResumen={modalResumen}
              editForm={ editForm }
            />
          </Col>
        </Row>
    );
}

export default PanelScript;