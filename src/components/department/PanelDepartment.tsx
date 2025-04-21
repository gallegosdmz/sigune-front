import { useEffect, useState } from "react"
import { Department } from "../../interfaces/Department"
import { Col, Form, Row } from "antd";
import * as DepartmentUtils from '../../utils/DepartmentUtils';
import ListDepartments from "./ListDepartments";
import CreateDepartment from "./CreateDepartment";
import EditDepartment from "./EditDepartment";

const PanelDepartment: React.FC = () => {
    // STATES
    const [ departments, setDepartments ] = useState<Department[]>([]);
    const [ visibleAdd, setVisibleAdd ] = useState<boolean>( false );
    const [ visibleEdit, setVisibleEdit ] = useState<boolean>( false );

    const [ department, setDepartment ] = useState<Department | null>( null );
    
    // FORMS
    const [ editForm ] = Form.useForm();

    // Asignar Departamentos
    useEffect(() => {
        DepartmentUtils.handleSetDepartments( setDepartments );
    }, []);

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <CreateDepartment
                setDepartments={ setDepartments }
                setVisibleAdd={ setVisibleAdd }
                visibleAdd={ visibleAdd }
            />

            <EditDepartment
                department={ department }
                setDepartments={ setDepartments }
                setVisibleEdit={ setVisibleEdit }
                visibleEdit={ visibleEdit }
                editForm={ editForm }
            />

            <ListDepartments
                departments={ departments }
                setVisibleAdd={ setVisibleAdd }
                setVisibleEdit={ setVisibleEdit }
                setDepartment={ setDepartment }
                setDepartments={ setDepartments }
                editForm={ editForm }
            />
          </Col>
        </Row>
    );
}

export default PanelDepartment;