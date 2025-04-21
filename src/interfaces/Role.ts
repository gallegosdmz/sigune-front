import { Department } from "./Department";
import { User } from "./User";

export interface Role {
    id: number,
    name: string,
    department: number | Department,
    users?: User[],
    permissions?: string[],
}