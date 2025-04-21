import { Script } from "./Script";
import { User } from "./User";

export interface Content {
    id?: number;
    type: string;
    title: string;
    textContent: string;
    url?: string;
    position?: number;
    status: boolean;
    script?: number | Script;
    user?: number | User;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}