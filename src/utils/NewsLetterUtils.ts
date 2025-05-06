import { FormInstance, message, Modal } from "antd";
import { NewsLetter } from "../interfaces/NewsLetter";
import { createNewsLetter, deleteNewsLetter, getNewsLetters, updateNewsLetter } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";

const { confirm } = Modal;

export const handleSetNewsLetters = async(
    setNewsLetters: (newsLetters: (prevNewLetters: NewsLetter[]) => NewsLetter[]) => void
) => {
    try {
        const newsLetters = await getNewsLetters();
        setNewsLetters(newsLetters);

    } catch (error) {
        handleErrorServer(error);
    }
}

// Handles - Ver Boletín
export const handleModalView = async(
    newsLetter: NewsLetter,
    setNewsLetter: (newsLetter: NewsLetter) => void,
    setModalView: (modalView: boolean) => void
) => {
    setNewsLetter(newsLetter);
    setModalView(true);
}

// Handles - Agregar Boletín
export const handleAddCancel = (
    setVisibleAdd: (visibleAdd: boolean) => void,
    addForm: FormInstance
) => {
    setVisibleAdd(false);
    addForm.resetFields();
}

export const handleAddSave = async(
    addForm: FormInstance,
    setNewsLetters: (newsLetters: (prevNewsLetters: NewsLetter[]) => NewsLetter[]) => void,
    setVisibleAdd: (visibleAdd: boolean) => void
) => {
    try {
        const values = await addForm.validateFields();
        await createNewsLetter(values);

        const newsLetters = await getNewsLetters();
        setNewsLetters(newsLetters);

        message.success('Boletín agregado correctamente');

        setVisibleAdd(false);
        addForm.resetFields();

    } catch (error) {
        handleErrorServer(error);
    }
}

// Handles - Editar Boletín
export const handleEdit = (
    record: NewsLetter,
    setNewsLetter: (newsLetter: NewsLetter) => void,
    editForm: FormInstance,
    setVisibleEdit: (visibleEdit: boolean) => void
) => {
    setNewsLetter(record);
    editForm.setFieldsValue(record);

    setVisibleEdit(true);
}

export const handleEditCancel = async(
    setVisibleEdit: (visibleEdit: boolean) => void,
    editForm: FormInstance
) => {
    setVisibleEdit(false);
    editForm.resetFields();
}

export const handleEditSave = async(
    record: NewsLetter,
    editForm: FormInstance,
    setNewsLetters: (newsLetters: (prevNewsLetters: NewsLetter[]) => NewsLetter[]) => void,
    setVisibleEdit: (visibleEdit: boolean) => void
) => {
    try {
        const values = await editForm.validateFields();
        await updateNewsLetter(record.id, values);

        const newsLetters = await getNewsLetters();
        setNewsLetters(newsLetters);

        message.success('Boletín editado correctamente');

        setVisibleEdit(false);
        editForm.resetFields();

    } catch (error) {
        handleErrorServer(error);
    }
}

// Handles - Eliminar Boletín
export const handleDelete = (
    record: NewsLetter,
    setNewsLetters: (newsLetters: (prevNewsLetters: NewsLetter[]) => NewsLetter[]) => void,
) => {
    confirm({
      title: 'Confirmación de Eliminación',
      content: `¿Estás seguro de que quieres eliminar el boletín?`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        handleDeleteSave(record, setNewsLetters);  
      }
    });
}

export const handleDeleteSave = async(
    newsLetter: NewsLetter,
    setNewsLetters: (newsLetters: (prevNewsLetters: NewsLetter[]) => NewsLetter[]) => void,
) => {
    try {
        await deleteNewsLetter(newsLetter.id);
        message.success('Boletín eliminado correctamente');

        const newsLetters = await getNewsLetters();
        setNewsLetters(newsLetters);

    } catch (error) {
        handleErrorServer(error);
    }
}