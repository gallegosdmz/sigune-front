import { Script } from "./Script";
import { User } from "./User";

export interface ContentFile {
    id?: number;
    url?: string;
    isDeleted?: boolean;
}

export interface Content {
    id?: number;
    type: string;
    title: string;
    head: string;
    textContent: string;
    dependence: string;
    classification: string;
    url?: string;
    position?: number;
    status: boolean;
    script?: number | Script | null;
    user?: number | User;
    contentsFiles?: ContentFile[];
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}