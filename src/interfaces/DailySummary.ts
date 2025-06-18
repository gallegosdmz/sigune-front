import { Content } from "./Content";

export interface DailySummary {
    id?: number;
    date: string;
    contents: Content[] | number[] | null;
    weeklySummary?: number | null;
}