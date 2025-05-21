import { message } from "antd";
import axios from "axios";

export const handleErrorServer = ( error: unknown ): void => {
    // Verifica si el error proviene de Axios
    if ( axios.isAxiosError( error ) ) {
        message.error( error.response?.data.error );
    } else {
        console.log(error);
        message.error('Ocurrió un error inesperado');
    }
}

export const handleError = ( error: string ): void => {
    message.error( error );
}