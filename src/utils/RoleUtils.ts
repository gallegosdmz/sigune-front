import { FormInstance, message, Modal } from "antd";
import { Role } from "../interfaces/Role";
import { createRole, deleteRole, getRole, getRoles, updateRole } from "../services/ApiCalls";
import React from "react";
import { handleErrorServer } from "./Custom/CustomErrors";

const { confirm } = Modal;

export const handleSetRoles = async( setRoles: React.Dispatch< React.SetStateAction< Role[] > > ) => {
    const roles = await getRoles();

    setRoles( roles );
}

// Handles - Agregar Puesto

export const handleAdd = ( setVisibleAdd: ( visibleAdd: boolean ) => void ) => {
    setVisibleAdd( true );
}

export const handleAddCancel = (
    setVisibleAdd: ( visibleAdd: boolean ) => void,
    addFormRole: FormInstance
) => {
    setVisibleAdd( false );
    addFormRole.resetFields();
}

export const handleAddSave = async(
    addFormRole: FormInstance,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void,
    setVisibleAdd: ( visibleAdd: boolean ) => void
) => {
    try {
        const values = await addFormRole.validateFields();

        await createRole( values );
        const roles = await getRoles();
        setRoles( roles );

        message.success('Puesto agregado exitosamente');

        setVisibleAdd( false );
        addFormRole.resetFields();

    } catch ( error ) {
        
        handleErrorServer( error );
    }
}

// Handles - Ver Puesto
export const handleModalView = async(
    id: number,
    setRole: ( role: Role ) => void,
    setModalViewRole: ( modalViewRole: boolean ) => void
) => {
    try {
        const role = await getRole( id );
        setRole( role );
        setModalViewRole( true );
    

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Editar Puesto
export const handleEdit = (
    record: Role,
    setRole: ( role: Role ) => void,
    editFormRole: FormInstance,
    setVisibleEditRole: ( visibleEditRole: boolean ) => void
) => {
    setRole( record )
    if ( typeof record.department === 'object' ) {
        editFormRole.setFieldsValue({
            ...record,
            department: record.department.id
        });
    }
    setVisibleEditRole( true );
}

export const handleEditCancel = (
    setVisibleEditRole: ( visibleEditRole: boolean ) => void,
    editFormRole: FormInstance
) => {
    setVisibleEditRole( false );
    editFormRole.resetFields();
}

export const handleEditSave = async (
    role: Role | null,
    editFormRole: FormInstance,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void,
    setVisibleEditRole: ( visibleEditRole: boolean ) => void
) => {
    if ( !role ) return message.error('El puesto no ha sido encontrado');

    try {
        const values = await editFormRole.validateFields();

        

        await updateRole( role.id!, values );

        

        const updatedRoles = await getRoles();

        
        setRoles( updatedRoles );
        

        message.success('Puesto editado existosamente');

        setVisibleEditRole( false );
        editFormRole.resetFields();
        
    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handle - Eliminar Puesto
export const handleDelete = (
    role: Role | null,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void
) => {
    if ( !role ) return message.error('El puesto no ha sido encontrado');

    confirm({
        title: 'Confirmación de Eliminación',
        content: `¿Estás seguro de que quieres eliminar el puesto ${ role.name }?`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk() {
        handleDeleteSave( role, setRoles );  
        }
    });
}

export const handleDeleteSave = async (
    role: Role | null,
    setRoles: ( roles: ( prevRoles: Role[] ) => Role[] ) => void
) => {
    if ( !role ) return message.error('El puesto no ha sido encontrado');

    try {
        await deleteRole( role.id );
        message.success('Puesto eliminado exitosamente');

        const roles = await getRoles();
        setRoles( roles );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles Form
export const handlePermissionsChange = (
    checkedValues: string[],
    setSelectedPermissions: React.Dispatch<React.SetStateAction<string[]>>,
    permissionsOptions: { label: string; value: string }[],
): string[] => {
    
    // Si se selecciona "admin_user", seleccionar todos los permisos
    if ( checkedValues.includes("admin_user") ) {
        const allPermissions = permissionsOptions.map( ( option ) => option.value );
        setSelectedPermissions( allPermissions );
        return allPermissions;
    } else {
        // Si "admin_user" estaba seleccionado antes pero ahora se deseleccionó,
        // necesitamos filtrar "admin_user" de los valores seleccionados
        const filteredValues = checkedValues.filter( ( value ) => value !== "admin_user" );
        setSelectedPermissions( filteredValues );
        return filteredValues;
    }
}