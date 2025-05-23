import { FormInstance, message, Modal } from "antd";
import { User } from "../interfaces/User";
import { handleError, handleErrorServer } from "./Custom/CustomErrors";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "../services/ApiCalls";

const { confirm } = Modal;

// Handles - Recibir Usuarios
export const handleSetUsers = async( setUsers: React.Dispatch<React.SetStateAction<User[]>> ) => {
    try {
        const users = await getUsers();
        setUsers( users );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Agregar Usuario
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

export const handleAddSave = async (
    addForm: FormInstance,
    setUsers: (users: (prevUsers: User[]) => User[]) => void,
    setVisibleAdd: (visibleAdd: boolean) => void,
  ) => {
    try {
      // Validacion de campos en formulario
      const values = await addForm.validateFields();
      const { confirmPassword, ...userData } = values;
  
      if (userData.password !== confirmPassword) {
        return handleError('Las contraseñas no coinciden');
      }
  
      // Crear Usuario
      await createUser( userData );
  
      // Actualizar usuarios 
      const updatedUsers = await getUsers();
      setUsers( updatedUsers );
  
      message.success('Usuario agregado exitosamente');

      setVisibleAdd( false );
      addForm.resetFields();

    } catch (error) {
        

        handleErrorServer( error );
    }
};

// Handles Ver Usuario
export const handleModalView = async(
  id: number,
  setUser: ( user: User ) => void,
  setModalView: ( modalView: boolean ) => void
) => {
  try {
    const user = await getUser( id );

    setUser( user );
    setModalView( true );

  } catch ( error ) {
    handleErrorServer( error );
  }
}

// Handles Editar Usuario
export const handleEdit = (
  record: User,
  setUser: ( user: User ) => void,
  editForm: FormInstance,
  setVisibleEdit: ( visibleEdit: boolean ) => void 
) => {
  setUser( record );
  if ( typeof record.role === 'object' ) {
    editForm.setFieldsValue({
      ...record,
      role: record.role.id
    });
  } 
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
  user: User | null,
  editForm: FormInstance,
  setUsers: ( users: ( prevUsers: User[] ) => User[] ) => void,
  setVisibleEdit: ( visibleEdit: boolean ) => void
) => {
  if ( !user ) return message.error('El usuario no ha sido encontrado');

  try {
    const values = await editForm.validateFields();

    await updateUser( user.id!, values );

    const updatedUsers = await getUsers();
    setUsers( updatedUsers );

    message.success('Usuario editado correctamente');

    setVisibleEdit( false );
    editForm.resetFields();

  } catch ( error ) {
    handleErrorServer( error );
  }
}

// Handle Eliminar Usuario
export const handleDelete = (
  user: User | null,
  setUsers: ( users: ( prevUsers: User[] ) => User[] ) => void, 
) => {
  if ( !user ) return message.error('El usuario no ha sido encontrado');
  
  confirm({
    title: 'Confirmación de Eliminación',
    content: `¿Estás seguro de que quieres eliminar el usuario ${ user.name} ${ user.surname }?`,
    okText: 'Eliminar',
    okType: 'danger',
    cancelText: 'Cancelar',
    onOk() {
      handleDeleteSave( user, setUsers );  
    }
  });
}
  
export const handleDeleteSave = async (
  user: User | null,
  setUsers: ( users: ( prevUsers: User[] ) => User[] ) => void
) => {
  if ( !user ) return message.error('El usuario no ha sido encontrado');

  try {
    await deleteUser( user.id! );
    message.success('Usuario eliminado correctamente');

    const users = await getUsers();
    setUsers( users );

  } catch ( error ) {
    handleErrorServer( error );
  }
}

// Handles - Formularios
export const handleValidatePassword = (_: any, value: string) => {
  const passwordRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  if (!value || passwordRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("La contraseña debe tener mayúsculas, minúsculas y al menos un número o carácter especial.");
}

export const handleValidateCURP = (_: any, value: string) => {
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]{2}$/;
  if (!value || curpRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("CURP inválida. Verifica el formato.");
}

export const handleValidateRFC = (_: any, value: string) => {
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
  if (!value || rfcRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject("RFC inválido. Verifica el formato.");
}