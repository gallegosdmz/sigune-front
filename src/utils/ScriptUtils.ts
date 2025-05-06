import { FormInstance, message, Modal } from "antd";
import { Script } from "../interfaces/Script";
import { createScript, deleteScript, getScripts, updateScript } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";

const { confirm } = Modal;

// Handles - Recibir Guiones

export const handleSetScripts = async(
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void
) => {
    try {
        const scripts = await getScripts();
        setScripts( scripts );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Agregar Guion

export const handleAdd = (
    setVisibleAdd: ( visibleAdd: boolean ) => void
) => {
    setVisibleAdd( true );
}

export const handleAddCancel = (
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    addForm: FormInstance
) => {
    setVisibleAdd( false );
    addForm.resetFields();
}

export const handleAddSave = async (
    addForm: FormInstance,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void
) => {
    try {
        const values = await addForm.validateFields();

        const script = {
            ...values,
            status: false,
        }
        
        await createScript( script );
        const scripts = await getScripts();
        setScripts( scripts );

        message.success('Guión agregado correctamente');

        setVisibleAdd( false );
        addForm.resetFields();

    } catch ( error ) {
        

        handleErrorServer( error );
    }
}

// Handles - Editar Guión

export const handleEdit = (
    script: Script,
    setScript: ( script: Script ) => void,
    editForm: FormInstance,
    setVisibleEdit: ( visibleEdit: boolean ) => void
) => {
    setScript( script );
    editForm.setFieldsValue( script );

    setVisibleEdit( true );
}

export const handleEditCancel = (
    setVisibleEdit: ( visibleEdit: boolean ) => void,
    editForm: FormInstance
) => {
    setVisibleEdit( false );
    editForm.resetFields();
}

export const handleEditSave = async (
    script: Script | null,
    editForm: FormInstance,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void
) => {
    if ( !script ) return message.error('El guión no ha sido encontrado');

    try {
        const values = await editForm.validateFields();

        await updateScript( script.id, values );

        const updatedScripts = await getScripts();
        setScripts( updatedScripts );

        message.success('Guión editado correctamente');

        setVisibleEdit( false );
        editForm.resetFields();

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handle - Eliminar Guión

export const handleDelete = (
    script: Script | null,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void
) => {
    if ( !script ) return message.error('El guión no ha sido encontrado');

    confirm({
        title: 'Confirmación de Eliminación',
        content: `¿Estás seguro de que quieres eliminar el guión ${ script.title }?`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
            handleDeleteSave( script, setScripts );  
        }
    });
}

export const handleDeleteSave = async(
    script: Script | null,
    setScripts: ( scripts: ( prevScripts: Script[] ) => Script[] ) => void
) => {
    if ( !script ) return message.error('El guión no ha sido encontrado');
    
    try {
        await deleteScript( script.id );
        message.success('Guión eliminado exitosamente');

        const scripts = await getScripts();
        setScripts( scripts );

    } catch ( error ) {
        handleErrorServer( error );
    }
}
