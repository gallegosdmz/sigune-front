import { Role } from "./Role";

export interface Department {
    id: number;
    name: string;
    roles: Role[];
}