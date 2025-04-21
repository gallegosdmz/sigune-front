import { Button, Drawer, Form, FormInstance, Input } from "antd"
import { Script } from "../../interfaces/Script"
import * as ScriptUtils from '../../utils/ScriptUtils';

type Props = {
    script: Script | null,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    visibleEdit: boolean,
    editForm: FormInstance
}

const EditScript: React.FC<Props> = ({ script, setScripts, setVisibleEdit, visibleEdit, editForm }) => {
    return (
        <Drawer
            title="Editar Guión"
            open={ visibleEdit }
            onClose={ () => ScriptUtils.handleEditCancel( setVisibleEdit, editForm ) }
            footer={
            <div style={{ textAlign: 'right' }}>
                <Button
                onClick={() =>
                    ScriptUtils.handleEditSave(
                    script,
                    editForm,
                    setScripts,
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

export default EditScript;