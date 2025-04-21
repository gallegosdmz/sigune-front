import { addDepartment, deleteDepartment, getDepartments, updateDepartment } from '../services/ApiCalls';
import { FormInstance, message, Modal } from 'antd';
import { Department } from '../interfaces/Department';
import { handleErrorServer } from './Custom/CustomErrors';

const { confirm } = Modal;

export const handleSetDepartments = async( setDepartments: React.Dispatch<React.SetStateAction<Department[]>> ) => {
    try {
        const departments = await getDepartments();
        setDepartments( departments );
    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Agregar Departamento

export const handleAdd = ( setVisibleAdd: ( visibleAdd: boolean ) => void ) => {
    setVisibleAdd( true );
}

export const handleAddCancel = (
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    addForm: FormInstance
) => {
    setVisibleAdd( false );
    addForm.resetFields();
}

export const handleAddSave = async(
    addForm: FormInstance,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void
) => {
    try {
        const values = await addForm.validateFields();
        const { name } = values;

        await addDepartment({ name });
        const departments = await getDepartments();
        setDepartments( departments );

        message.success('Departamento agregado exitosamente');

        setVisibleAdd( false );
        addForm.resetFields();

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Editar Departamento
export const handleEdit = (
    department: Department,
    setDepartment: ( department: Department ) => void,
    editForm: FormInstance,
    setVisibleEdit: ( visibleEdit: boolean ) => void
) => {
    setDepartment( department );
    editForm.setFieldsValue( department );

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
    department: Department | null,
    editForm: FormInstance,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
    setVisibleEdit: ( visibleEdit: boolean ) => void
) => {
    if ( !department ) return message.error('El departmento no ha sido encontrado');

    try {
        const values = await editForm.validateFields();
        
        await updateDepartment( department.id, values );

        const updatedDepartments = await getDepartments();
        setDepartments( updatedDepartments );

        message.success('Departamento editado exitosamente');

        setVisibleEdit( false );
        editForm.resetFields();
        
    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handle - Eliminar Departamento

export const handleDelete = (
    department: Department | null,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void,
) => {
    if ( !department ) return message.error('El departamento no ha sido encontrado');

    confirm({
        title: 'Confirmación de Eliminación',
        content: `¿Estás seguro de que quieres eliminar el departamento ${ department.name }?`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
            handleDeleteSave( department, setDepartments );  
        }
    });
}

export const handleDeleteSave = async(
    department: Department | null,
    setDepartments: ( departments: ( prevDepartments: Department[] ) => Department[] ) => void
) => {
    if ( !department ) return message.error('El departamento no ha sido encontrado');

    try {
        await deleteDepartment( department.id );
        message.success('Departamento eliminado exitosamente');

        const departments = await getDepartments();
        setDepartments( departments );

    } catch ( error ) {
        handleErrorServer( error );
    }
}
