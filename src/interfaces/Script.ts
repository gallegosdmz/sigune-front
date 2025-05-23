import { Content } from "./Content";
import { User } from "./User";

export interface Script {
    id: number;
    user?: number | User;
    title: string;
    dateEmission: Date;
    farewell: string;
    status: boolean;
    contents?: Content[] | null;
}