import axios from "axios";
import { Role } from "../interfaces/Role";
import { User } from "../interfaces/User";
import { Script } from "../interfaces/Script";
import { Content } from "../interfaces/Content";
import { NewsLetter } from "../interfaces/NewsLetter";
import { WeeklySummary } from "../interfaces/WeeklySummary";
import { DailySummary } from "../interfaces/DailySummary";
const API_URL = 'http://82.25.93.144/api';

const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${ localStorage.getItem('token')}`
    }
});

// API

// DEPARTMENTS

export const getDepartments = async() => {
    const response = await axios.get(
        `${ API_URL }/departments/`,
        getAuthHeaders()
    );

    return response.data;
}

export const getDepartment = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/departments/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const addDepartment = async( department: { name: string } ) => {
    const response = await axios.post(
        `${ API_URL }/departments/`,
        department,
        getAuthHeaders()
    );

    return response.data;
}

export const updateDepartment = async( id: number, department: { name: string } ) => {
    const response = await axios.patch(
        `${ API_URL }/departments/${ id }`,
        department,
        getAuthHeaders()
    );

    return response.data;
}

export const deleteDepartment = async( id: number ) => {
    const response = await axios.delete(
        `${ API_URL }/departments/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

// ROLES

export const getRoles = async() => {
    const response = await axios.get(
        `${ API_URL }/roles/`,
        getAuthHeaders()
    );

    return response.data;
}

export const getRole = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/roles/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const createRole = async( role: Role ) => {
    const response = await axios.post(
        `${ API_URL }/roles/`,
        role,
        getAuthHeaders()
    );

    return response.data;
}

export const updateRole = async( id: number, role: Role ) => {
    const response = await axios.patch(
        `${ API_URL }/roles/${ id }`,
        role,
        getAuthHeaders()
    );

    return response.data;
}

export const deleteRole = async( id: number ) => {
    const response = await axios.delete(
        `${ API_URL }/roles/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

// USERS

export const getUsers = async() => {
    const response = await axios.get(
        `${ API_URL }/users/`,
        getAuthHeaders()
    );

    return response.data;
}

export const getUser = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL}/users/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const createUser = async( user: User ) => {
    const response = await axios.post(
        `${ API_URL }/auth/register`,
        user,
        getAuthHeaders()
    );

    return response.data;
}

export const updateUser = async( id: number, user: User ) => {
    const response = await axios.patch(
        `${ API_URL }/users/${ id }`,
        user,
        getAuthHeaders()
    );

    return response.data;
}

export const deleteUser = async( id: number ) => {
    const response = await axios.delete(
        `${ API_URL }/users/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const fetchLogin = async( email: string, password: string ) => {
    const data = {
        institucionalEmail: email,
        password: password,
    };

    try {
        const response = await axios.post(`${ API_URL }/auth/login`, data);

        return response.data;

    } catch ( error ) {
        // Verifica si el error proviene de Axios
        if ( axios.isAxiosError( error ) ) {
            

            return error.response?.data;
        } else {
            return 'Ocurrió un error inesperado';
        }
    }
}

// SCRIPTS

export const getScripts = async() => {
    const response = await axios.get(
        `${ API_URL }/scripts?limit=500`,
        getAuthHeaders()
    );

    return response.data;
}

export const getScriptWithContentApproved = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/withContentApproved/${ id }`,
        getAuthHeaders()
    );

    return response.data
}

export const getScriptWithContentDisapproved = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/withContentDisapproved/${ id }`,
        getAuthHeaders()
    );

    return response.data
}

export const getScript = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const getReport = async(startDate: Date, endDate: Date) => {
    const data = {
        startDate,
        endDate,
    }

    const response = await axios.post(
        `${ API_URL }/scripts/count-contents-by-date`,
        data,
        getAuthHeaders(),
    );

    return response.data;
}

export const createScript = async( script: Script ) => {
    const response = await axios.post(
        `${ API_URL }/scripts`,
        script,
        getAuthHeaders()
    );

    return response.data;
}

export const updateScript = async( id: number, script: Script ) => {
    const response = await axios.patch(
        `${ API_URL }/scripts/${ id }`,
        script,
        getAuthHeaders()
    );

    return response.data;
}

export const deleteScript = async( id: number ) => {
    const response = await axios.delete(
        `${ API_URL }/scripts/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

// CONTENTS
export const createContent = async( content: Content ) => {
    const response = await axios.post(
        `${ API_URL }/scripts/content`,
        content,
        getAuthHeaders()
    );

    return response.data;
}

export const getContents = async() => {
    const response = await axios.get(
        `${ API_URL }/scripts/contents`,
        getAuthHeaders()
    );

    return response.data;
}

export const getContentsForUser = async() => {
    const response = await axios.get(
        `${ API_URL }/scripts/contents-for-user`,
        getAuthHeaders()
    );

    return response.data;
}

export const getContentsForScript = async ( idScript: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/contents-for-script/${ idScript }`,
        getAuthHeaders()
    );

    return response.data;
}

export const getContentsApprovedForScript = async( idScript: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/withContentApproved/${ idScript }`,
        getAuthHeaders()
    );

    return response.data;
}

export const getContentsDisapprovedForScript = async() => {
    const response = await axios.get(
        `${ API_URL }/scripts/withContentDisapproved`,
        getAuthHeaders()
    );

    return response.data;
}

export const getContent = async( id: number ) => {
    const response = await axios.get(
        `${ API_URL }/scripts/content/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

export const updateContent = async( id: number, content: Content ) => {
    const response = await axios.patch(
        `${ API_URL }/scripts/content/update/${ id }`,
        content,
        getAuthHeaders()
    );

    return response.data;
}

export const changePositionContent = async( id: number, position: number ) => {
    const data = {
        position: position,
    }

    const response = await axios.patch(
        `${ API_URL }/scripts/content/change-position/${ id }`,
        data,
        getAuthHeaders()
    );

    return response.data;
}

export const deleteContent = async( id: number ) => {
    const response = await axios.delete(
        `${ API_URL }/scripts/content/delete/${ id }`,
        getAuthHeaders()
    );

    return response.data;
}

// FILES 
export const createFileAudio = async(contentId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
  
    const response = await axios.post(
      `${API_URL}/files/${contentId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        }
      }
    );
  
    
    return response.data;
  };

export const getFileAudio = async( fileId: string ) => {
    const response = await axios.get(
        `${ API_URL }/files/${ fileId }`,
        getAuthHeaders(),
    );

    return response.data;
}

// BITACORAS
export const createNewsLetter = async(newsLetter: NewsLetter) => {
    const response = await axios.post(
        `${ API_URL }/newsletters`,
        newsLetter,
        getAuthHeaders(),
    );

    return response.data;
}

export const getNewsLetters = async() => {
    const response = await axios.get(
        `${ API_URL }/newsletters`,
        getAuthHeaders(),
    );

    return response.data;
}

export const getNewsLetterForPeriod = async(period: number) => {
    const response = await axios.get(
        `${ API_URL }/scripts/newsletters-for-period/${ period }`,
        getAuthHeaders(),
    );

    return response.data;
}

export const getNewsLetter = async(id: number) => {
    const response = await axios.get(
        `${ API_URL }/newsletters/${ id }`,
        getAuthHeaders(),
    );

    return response.data;
}

export const updateNewsLetter = async(id: number, newsLetter: NewsLetter) => {
    const response = await axios.patch(
        `${ API_URL }/newsletters/${ id }`,
        newsLetter,
        getAuthHeaders(),
    );

    return response.data;
}

export const deleteNewsLetter = async(id: number) => {
    const response = await axios.delete(
        `${ API_URL }/newsletters/${ id }`,
        getAuthHeaders(),
    );

    return response.data;
}

// Weekly Summarys
export const getWeeklySummarys = async() => {
    const response = await axios.get(
        `${ API_URL }/weekly-summarys/`,
        getAuthHeaders(),
    );

    return response.data;
}

export const getWeeklySummary = async(id: number) => {
    const response = await axios.get(
        `${ API_URL }/weekly-summarys/${id}`,
        getAuthHeaders(),
    );

    return response.data;
}

export const createWeeklySummary = async(date: string) => {
    const data = {
        date: date,
    }
    
    const response = await axios.post(
        `${ API_URL }/weekly-summarys/`,
        data,
        getAuthHeaders(),
    );

    return response.data;
}

export const updateWeeklySummary = async(id: number, data: WeeklySummary) => {
    const response = await axios.patch(
        `${ API_URL }/weekly-summarys/${id}`,
        data,
        getAuthHeaders(),
    );

    return response.data;
}

export const deleteWeeklySummary = async(id: number) => {
    const response = await axios.delete(
        `${ API_URL }/weekly-summarys/${id}`,
        getAuthHeaders(),
    );

    return response.data;
}

export const getDailySummarys = async() => {
    const response = await axios.get(
        `${ API_URL }/daily-summarys`,
        getAuthHeaders(),
    );

    return response.data;
}

export const getDailySummary = async(id: number) => {
    const response = await axios.get(
        `${ API_URL }/daily-summarys/${id}`,
        getAuthHeaders(),
    );

    return response.data;
}

export const createDailySummary = async(data: DailySummary) => {
    const response = await axios.post(
        `${ API_URL }/daily-summarys`,
        data,
        getAuthHeaders(),
    );

    return response.data;
}

export const updateDailySummary = async(id: number, data: DailySummary) => {
    const response = await axios.patch(
        `${ API_URL }/daily-summarys/${id}`,
        data,
        getAuthHeaders(),
    );

    return response.data;
}

export const deleteDailySummary = async(id: number) => {
    const response = await axios.delete(
        `${ API_URL }/daily-summarys/${id}`,
        getAuthHeaders(),
    );

    return response.data;
}

export const mergeContents = async(
    dailySummaryId: number,
    contentIdsToRemove: number[],
    newContentData: {
        type: string;
        title: string;
        head: string;
        textContent: string;
        classification: string;
        dependence?: string;
        url?: string;
        position?: number;
        status?: boolean;
    }
) => {
    const response = await axios.post(
        `${ API_URL }/daily-summarys/${dailySummaryId}/merge-contents`,
        {
            contentIdsToRemove,
            newContentData
        },
        getAuthHeaders(),
    );

    return response.data;
}

export const closeSystem = async() => {
    const response = await axios.patch(
        `${ API_URL }/roles/closeSystem`,
        {},
        getAuthHeaders(),
    );

    return response.data;
}

export const openSystem = async() => {
    const response = await axios.patch(
        `${ API_URL }/roles/openSystem`,
        {},
        getAuthHeaders(),
    );

    return response.data;
}

export const getSystemStatus = async() => {
    const response = await axios.get(
        `${ API_URL }/roles`,
        getAuthHeaders(),
    );

    return response.data;
}

export const addContentToDailySummary = async(dailySummaryId: number, contentId: number) => {
    const url = `${ API_URL }/daily-summarys/${dailySummaryId}/add-content`;
    console.log('URL del endpoint:', url);
    console.log('Payload:', { contentId });
    
    const response = await axios.post(
        url,
        {
            contentId: contentId
        },
        getAuthHeaders(),
    );

    return response.data;
}