import { Role } from "./Role";

export interface User {
    id?: number,
    name: string,
    surname: string,
    institucionalEmail: string,
    password: string,
    role: number | Role,
    numEmployee: number,
    phone: string,
    address: string,
    curp: string,
    rfc: string,
    dateAdmission: Date,
    level: number,
    birthdate: Date,
    gender: number
}