import { useEffect, useState } from "react"
import * as RoleUtils from '../../utils/RoleUtils';
import { Role } from "../../interfaces/Role";
import { Col, Form, Row } from "antd";
import CreateRole from "./CreateRole";
import ListRoles from "./ListRoles";
import EditRole from "./EditRole";

const PanelRole: React.FC = () => {
    //STATES
    const [ roles, setRoles ] = useState<Role[]>([]);
    const [ visibleAdd, setVisibleAdd ] = useState<boolean>( false );
    const [ visibleEdit, setVisibleEdit ] = useState<boolean>( false );

    const [ role, setRole ] = useState<Role | null>( null );

    // FORMS
    const [ editFormRole ] = Form.useForm();

    useEffect(() => {
        RoleUtils.handleSetRoles( setRoles );
    })

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <CreateRole
              setRoles={ setRoles }
              setVisibleAdd={ setVisibleAdd }
              visibleAdd={ visibleAdd }
            />

            <ListRoles
              roles={ roles }
              setVisibleAdd={ setVisibleAdd }
              setVisibleEdit={ setVisibleEdit }
              setRole={ setRole }
              setRoles={ setRoles }
              editFormRole={ editFormRole }
            />

            <EditRole
              role={ role }
              setRoles={ setRoles }
              setVisibleEditRole={ setVisibleEdit }
              visibleEditRole={ visibleEdit }
              editFormRole={ editFormRole }
            />
          </Col>
        </Row>
    )
}

export default PanelRole;