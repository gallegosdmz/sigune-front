import { DailySummary } from "./DailySummary";

export interface WeeklySummary {
    id: number;
    date: Date;
    dailySummarys?: DailySummary[] | null;
}