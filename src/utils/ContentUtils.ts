import { FormInstance, message } from "antd";
import { Content } from "../interfaces/Content";
import { changePositionContent, createContent, createFileAudio, deleteContent, getContentsApprovedForScript, getContentsDisapprovedForScript, getContentsForScript, getContentsForUser, getFileAudio, updateContent } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";

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
    setContent( content );

    // Buscar audio
    if ( content.url !== 'Sin Audio' ) {
        const file = await getFileAudio( content.url! );
        
        setFile( file );
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
    setVisibleViewContent: ( visibleViewContent: boolean ) => void
) => {
    const today = new Date();
    const createdAt = new Date(record.createdAt!);

    const isDifferentDay =
        createdAt.getFullYear() !== today.getFullYear() ||
        createdAt.getMonth() !== today.getMonth() ||
        createdAt.getDate() !== today.getDate();
    
    if (!isDifferentDay) {
        editForm.resetFields();
        setVisibleViewContent( false );

        return message.error('No puedes editar este contenido');
    }
    
    try {
        const values = await editForm.validateFields();
        const type = 'textContent' in values ? 'Nota' : 'Sección';

        await updateContent( record.id!, { script, type, ...values } );

        let contents;
        if ( script === null ) {
            contents = await getContentsForUser();
        } else {
            contents = await getContentsApprovedForScript( script! );
        }
        setContents( contents );

        message.success('Contenido editado correctamente');

        editForm.resetFields();
        setVisibleViewContent( false );


    } catch ( error ) {
        handleErrorServer( error );
    }
}

export const handleDisapprove = async(
    content: Content,
    script: number,
    setContents: ( contents: ( prevContents: Content[] ) => Content[] ) => void,
    setVisibleAddContent: ( visibleAddContent: boolean ) => void
) => {
    const { id, status, createdAt, updatedAt, isDeleted, ...contentDetails } = content;

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
    const { id, status, createdAt, updatedAt, isDeleted, ...contentDetails } = content;

    try {
        const contentData = {
            ...contentDetails,
            status: true,
            script,
        }

        await updateContent( id!, contentData );

        const contents = await getContentsDisapprovedForScript();
        setContents( contents );
        setVisibleAddContent( false );

        message.success('Contenido aprobado correctamente');

    } catch ( error ) {
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

        if (!values.dependence) {
            await createContent({
                type: 'Sección',
                title: values.title,
                textContent: 'Sn',
                dependence: 'Sn',
                classification: 'Sn',
                status: true,
                script: script,
            });

            setLoading(false);

            addForm.resetFields();
            setContents( await getContentsApprovedForScript( script! ) );
            setVisibleAddContent( false );

            return message.success('Contenido agregado exitosamente');
        }

        const { audioFile, ...valueDetails } = values;

        

        const fileObj = audioFile?.[0]?.originFileObj;

        const type = 'textContent' in values ? 'Nota' : 'Sección';

        // Logica para subir contenido
        // Subir audio
        let fileId = 'Sin Audio';
        if ( fileObj ) {
            const resAudio = await createFileAudio( fileObj );
            fileId = resAudio.fileId;
        }

        await createContent({ script, type, url: fileId, ...valueDetails });

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