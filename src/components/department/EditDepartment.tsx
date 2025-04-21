import { Button, Drawer, Form, FormInstance, Input } from "antd"
import { Department } from "../../interfaces/Department"
import * as DepartmentUtils from '../../utils/DepartmentUtils';

type Props = {
    department: Department | null,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    visibleEdit: boolean,
    editForm: FormInstance,
}

const EditDepartment: React.FC<Props> = ({ department, setDepartments, setVisibleEdit, visibleEdit, editForm }) => {

    return (
        <Drawer
            title="Editar Departamento"
            open={ visibleEdit }
            onClose={ () => DepartmentUtils.handleEditCancel( setVisibleEdit, editForm ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    DepartmentUtils.handleEditSave(
                    department,
                    editForm,
                    setDepartments,
                    setVisibleEdit
                    )
                }
                type="primary"
                >
                Guardar
                </Button>
            </div>
            }
        >
            <Form form={ editForm } layout="vertical">
                <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                  <Input placeholder="Nombre" />
                </Form.Item>
            </Form>
        </Drawer>
    );
}

export default EditDepartment;