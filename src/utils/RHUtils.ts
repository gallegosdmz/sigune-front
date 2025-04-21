import { message } from "antd";
import { Department } from "../interfaces/Department";
import { Role } from "../interfaces/Role";
import { User } from "../interfaces/User";
import { getDepartments, getRoles, getUsers } from "../services/ApiCalls";

export const fetchAndSetData = async(
    setDepartments: React.Dispatch< React.SetStateAction< Department[] > >,
    setRoles: React.Dispatch< React.SetStateAction < Role[] > >,
    setUsers: React.Dispatch< React.SetStateAction < User[] > >
) => {
    try {
        const [ departments, roles, users ] = await Promise.all([
            getDepartments(),
            getRoles(),
            getUsers() 
        ]);

        console.log( users.data );

        setDepartments( departments.data );
        setRoles( roles.data );
        setUsers( users.data );
        
    } catch ( error ) {
        if (error instanceof Error) {
            message.error(error.message);
        } else {
            message.error('Error inesperado');
        }

    }
}