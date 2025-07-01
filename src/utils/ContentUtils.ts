import { FormInstance, message } from "antd";
import { Content } from "../interfaces/Content";
import { changePositionContent, createContent, createFileAudio, deleteContent, getContents, getContentsApprovedForScript, getContentsDisapprovedForScript, getContentsForScript, getContentsForUser, getFileAudio, updateContent } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";
import axios from "axios";

export const handleSetContents = async(
    setContents: (contents: (prevContents: Content[]) => Content[]) => void
) => {
    try {
        setContents(await getContents());
    } catch (error) {
        handleErrorServer(error);
    }
}

export const handleSetContentsWithScript = async(
    idScript: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
) => {
    try {
        const contents = await getContentsForScript( idScript );
        setContents( contents );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleSetContentsForUser = async(
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void 
) => {
    try {
        const contents = await getContentsForUser();
        setContents(contents);
    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleSetContentsWithScriptApproved = async(
    idScript: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void
) => {
    try {
        const contents = await getContentsApprovedForScript( idScript );
        setContents( contents );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleSetContentsWithScriptDisapproved = async(
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void
) => {
    try {
        const contents = await getContentsDisapprovedForScript();
        setContents( contents );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleChangePosition = async(
    //idScript: number,
    contents: Content[],
    //setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    dragIndex: number,
    hoverIndex: number
) => {
    try {

        await changePositionContent( contents[0].id!, hoverIndex );
        await changePositionContent( contents[1].id!, dragIndex );

        //const contentsDB = await getContentsForScript( idScript );
        //setContents( contentsDB );

    } catch ( error ) {
        handleErrorServer( error );
    }
}

// Handles - Ver Contenido
export const handleModalView = async(
    content: Content,
    setContent: ( content: Content ) => void,
    setFile: ( file: any ) => void,
    setModalView: ( modalView: boolean ) => void,
) => {
    console.log('Content completo:', content);
    console.log('contentsFiles:', content.contentsFiles);
    setContent( content );

    // Buscar archivos relacionados
    if ( content.contentsFiles && content.contentsFiles.length > 0 ) {
        console.log('Procesando archivos:', content.contentsFiles.length);
        // Obtener cada archivo individualmente
        const filePromises = content.contentsFiles.map(async (contentFile) => {
            if (contentFile.url) {
                console.log('URL del archivo:', contentFile.url);
                // Extraer el fileId de la URL de Google Drive
                const fileId = contentFile.url.split('/')[5]; // La URL es: https://drive.google.com/file/d/{fileId}/view
                console.log('FileId extraído:', fileId);
                const file = await getFileAudio( fileId );
                console.log('Archivo obtenido:', file);
                return file;
            }
            return null;
        });

        const files = await Promise.all(filePromises);
        const validFiles = files.filter(file => file !== null);
        console.log('Archivos válidos:', validFiles);
        
        if (validFiles.length > 0) {
            setFile(validFiles);
        }
    } else {
        console.log('No hay archivos relacionados');
    }

    setModalView( true );
}

export const handleCopy = (e: any) => {
    e.preventDefault();
    message.error('No está permitido copiar el texto');
}

export const handleView = ( setVisibleViewContent: ( visibleViewContent: boolean ) => void ) => {
    setVisibleViewContent( true );
}

export const handleViewCancel = (
    setVisibleViewContent: ( visibleViewContent: boolean ) => void,
) => {
    setVisibleViewContent( false );
}

// Handles - Editar Contenido
export const handleEditCancel = (
    setVisibleViewContent: ( visibleViewContent: boolean ) => void,
    setFile: ( file: any ) => void,
) => {
    setVisibleViewContent( false );
    setFile(null);
}

export const handleEditSave = async(
    record: Content,
    editForm: FormInstance,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    script: number | null,
    setVisibleViewContent: ( visibleViewContent: boolean ) => void,
    setLoading: (loading: boolean) => void,
) => {
    setLoading(true); // Activamos el estado de loading

    const today = new Date();
    const createdAt = new Date(record.createdAt!);

    
    
    try {
        const values = await editForm.validateFields();
        const type = 'textContent' in values ? 'Nota' : 'Sección';

        const {mediaFile, ...vaueDetails} = values;

        // Lógica para subir múltiples archivos
        if (mediaFile && mediaFile.length > 0) {
            // Subir cada archivo individualmente
            const uploadPromises = mediaFile.map(async (file: any) => {
                if (file.originFileObj) {
                    const resAudio = await createFileAudio(record.id!, file.originFileObj);
                    return resAudio.fileId;
                }
                return null;
            });

            await Promise.all(uploadPromises);
        }

        await updateContent( record.id!, { script, type, ...vaueDetails } );

        let contents;
        if ( script === null ) {
            contents = await getContentsForUser();
        } else {
            contents = await getContentsApprovedForScript( script! );
        }
        setContents( contents );

        setLoading(false); 
        message.success('Contenido editado correctamente');

        editForm.resetFields();
        setVisibleViewContent( false );


    } catch ( error ) {
        console.log(error)
        handleErrorServer( error );
    }
}

export const handleEditSaveForContentsPanel = async(
    record: Content,
    editForm: FormInstance,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    script: number | null,
    setVisibleViewContent: ( visibleViewContent: boolean ) => void,
    setLoading: (loading: boolean) => void,
) => {
    setLoading(true); // Activamos el estado de loading

    
    try {
        const values = await editForm.validateFields();
        const type = 'textContent' in values ? 'Nota' : 'Sección';
        
        const {mediaFile, ...vaueDetails} = values;

        // Lógica para subir múltiples archivos
        if (mediaFile && mediaFile.length > 0) {
            // Subir cada archivo individualmente
            const uploadPromises = mediaFile.map(async (file: any) => {
                if (file.originFileObj) {
                    const resAudio = await createFileAudio(record.id!, file.originFileObj);
                    return resAudio.fileId;
                }
                return null;
            });

            await Promise.all(uploadPromises);
        }

        await updateContent( record.id!, { script, type, ...vaueDetails } );

        const contents = await getContents();
        setContents( contents );

        setLoading(false); 
        message.success('Contenido editado correctamente');

        editForm.resetFields();
        setVisibleViewContent( false );


    } catch ( error ) {
        console.log(error)
        handleErrorServer( error );
    }
}

export const handleDisapprove = async(
    content: Content,
    script: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void
) => {
    const { id, status, createdAt, updatedAt, isDeleted, contentsFiles, ...contentDetails } = content;

    try {
        const contentData = {
            ...contentDetails,
            status: false,
            script: null,
        }


        await updateContent( id!, contentData );
        

        const contents = await getContentsApprovedForScript( script );
        setContents( contents );
        setVisibleAddContent( false );

        message.success('Contenido desaprobado correctamente');

    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleApprove = async(
    content: Content,
    script: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void
) => {
    const { id, status, createdAt, updatedAt, isDeleted, contentsFiles, ...contentDetails } = content;

    try {
        const contentData = {
            ...contentDetails,
            status: true,
            script,
        }

        console.log('Datos que se envían al backend:', contentData);
        console.log('ID del contenido:', id);

        await updateContent( id!, contentData );

        const contents = await getContentsDisapprovedForScript();
        setContents( contents );
        setVisibleAddContent( false );

        message.success('Contenido aprobado correctamente');

    } catch ( error ) {
        console.error('Error en handleApprove:', error);
        handleErrorServer( error );
    }
}

// Handles - Agregar Contenido
export const handleAdd = ( setVisibleAddContent: ( visibleAddContent: boolean ) => void ) => {
    setVisibleAddContent( true );
}

export const handleAddCancel = (
    setVisibleAddContent: ( visibleAddContent: boolean ) => void,
) => {
    setVisibleAddContent( false );
}

export const handleAddSave = async(
    addForm: FormInstance,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    script: number | null,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void,
    setLoading: (loading: boolean) => void // Paso el setLoading aquí
) => {
    try {
        setLoading(true); // Activamos el estado de loading

        const values = await addForm.validateFields();

        console.log(values);

        if (!values.textContent) {
            await createContent({
                type: 'Sección',
                title: values.title,
                head: 'No contiene header, se esta haciendo el autorellenado para poder pasar la validación',
                textContent: 'Sn',
                dependence: 'Sn',
                classification: 'Sn',
                url: 'Sin Audio',
                status: true,
                script: script,
            });

            setLoading(false);

            addForm.resetFields();
            setContents( await getContentsApprovedForScript( script! ) );
            setVisibleAddContent( false );

            return message.success('Contenido agregado exitosamente');
        }

        const { mediaFile, ...valueDetails } = values;

        const type = 'textContent' in values ? 'Nota' : 'Sección';

        if (!valueDetails.classification) valueDetails.classification = 'Contenido General';

        // Crear el contenido primero
        const content = await createContent({ script, type, url: 'Sin Audio', ...valueDetails });

        // Lógica para subir múltiples archivos
        if (mediaFile && mediaFile.length > 0) {
            // Subir cada archivo individualmente
            const uploadPromises = mediaFile.map(async (file: any) => {
                if (file.originFileObj) {
                    const resAudio = await createFileAudio(content.id, file.originFileObj);
                    return resAudio.fileId;
                }
                return null;
            });

            await Promise.all(uploadPromises);
        }

        let contents;

        if ( script === null ) {
            contents = await getContentsForUser();
        } else {
            contents = await getContentsApprovedForScript( script! )
        }

        setLoading(false);

        message.success('Contenido agregado exitosamente');

        addForm.resetFields();
        setContents( contents );
        setVisibleAddContent( false );
        

    } catch ( error ) {
        console.log(error);
        setLoading(false);
        handleErrorServer( error );
    }
}

export const handleAddSaveForContentsPanel = async(
    addForm: FormInstance,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    script: number | null,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void,
    setLoading: (loading: boolean) => void // Paso el setLoading aquí
) => {
    try {
        setLoading(true); // Activamos el estado de loading

        const values = await addForm.validateFields();

        console.log(values);

        if (!values.textContent) {
            await createContent({
                type: 'Sección',
                title: values.title,
                head: 'No contiene header, se esta haciendo el autorellenado para poder pasar la validación',
                textContent: 'Sn',
                dependence: 'Sn',
                classification: 'Sn',
                url: 'Sin Audio',
                status: true,
                script: script,
            });

            setLoading(false);

            addForm.resetFields();
            setContents( await getContentsApprovedForScript( script! ) );
            setVisibleAddContent( false );

            return message.success('Contenido agregado exitosamente');
        }

        const { mediaFile, ...valueDetails } = values;

        const type = 'textContent' in values ? 'Nota' : 'Sección';

        if (!valueDetails.classification) valueDetails.classification = 'Contenido General';

        // Crear el contenido primero
        const content = await createContent({ script, type, url: 'Sin Audio', ...valueDetails });

        // Lógica para subir múltiples archivos
        if (mediaFile && mediaFile.length > 0) {
            // Subir cada archivo individualmente
            const uploadPromises = mediaFile.map(async (file: any) => {
                if (file.originFileObj) {
                    const resAudio = await createFileAudio(content.id, file.originFileObj);
                    return resAudio.fileId;
                }
                return null;
            });

            await Promise.all(uploadPromises);
        }

        const contents = await getContents();

        setLoading(false);

        message.success('Contenido agregado exitosamente');

        addForm.resetFields();
        setContents( contents );
        setVisibleAddContent( false );
        

    } catch ( error ) {
        console.log(error);
        setLoading(false);
        handleErrorServer( error );
    }
}


// Handles - Eliminar
export const handleDelete = async(
    content: Content,
    script: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void
) => {
    try {
        await deleteContent( content.id! );

        if ( !content.status ) setContents( await getContentsDisapprovedForScript() );
        if ( content.status ) setContents( await getContentsApprovedForScript( script ) ); 

        setVisibleAddContent( false );
        message.success('Contenido eliminado correctamente');

    } catch ( error ) {
        handleErrorServer( error );
    }
}

