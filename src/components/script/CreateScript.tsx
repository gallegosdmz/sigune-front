import { Button, Drawer, Form, FormInstance, Input } from "antd"
import { Script } from "../../interfaces/Script"
import * as ScriptUtils from '../../utils/ScriptUtils';

type Props = {
    addForm: FormInstance,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    visibleAdd: boolean
}

const CreateScript: React.FC<Props> = ({ addForm, setScripts, setVisibleAdd, visibleAdd }) => {
    return (
        <Drawer
            title="Añadir Nuevo Guión"
            open={ visibleAdd }
            onClose={ () => ScriptUtils.handleAddCancel( setVisibleAdd, addForm ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    ScriptUtils.handleAddSave(
                    addForm,
                    setScripts,
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
                <Form.Item name="title" label="Titulo" rules={[{ required: true, message: 'Ingresa el titulo' }]}>
                  <Input placeholder="Titulo" />
                </Form.Item>
                <Form.Item
                    name="dateEmission"
                    label="Fecha de Emisión"
                    rules={[
                    {
                        required: true,
                        message: 'Por favor confirme la fecha de emisión'
                    }
                    ]}
                >
                    <Input type="date" />
                </Form.Item>
                <Form.Item name="farewell" label="Despedida" rules={[{ required: true, message: 'Ingresa la despedida' }]}>
                  <Input placeholder="Despedida" />
                </Form.Item>
            </Form>
        </Drawer>
    );
}

export default CreateScript;