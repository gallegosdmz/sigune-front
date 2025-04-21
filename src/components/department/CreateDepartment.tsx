import { Button, Drawer, Form, Input } from "antd"
import { Department } from "../../interfaces/Department"
import * as DepartmentUtils from '../../utils/DepartmentUtils';

type Props = {
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    visibleAdd: boolean
}

const CreateDepartment: React.FC<Props> = ({ setDepartments, setVisibleAdd, visibleAdd }) => {
    // FORM
    const [ addForm ] = Form.useForm();

    return (
        <Drawer
            title="Añadir Nuevo Departamento"
            open={ visibleAdd }
            onClose={ () => DepartmentUtils.handleAddCancel( setVisibleAdd, addForm ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    DepartmentUtils.handleAddSave(
                    addForm,
                    setDepartments,
                    setVisibleAdd
                    )
                }
                type="primary"
                >
                Guardar
                </Button>
            </div>
            }
        >
            <Form form={ addForm } layout="vertical">
                <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                  <Input placeholder="Nombre" />
                </Form.Item>
            </Form>
        </Drawer>
    );
}

export default CreateDepartment;