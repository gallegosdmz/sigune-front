import { ScriptContentOption } from "./ScriptContent";

export interface Option {
    id?: number;
    type: string;
    url?: string | null;
    description: string;
    content: number;
    scriptContentOptions?: number | ScriptContentOption;
}