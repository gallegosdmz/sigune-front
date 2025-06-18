import { WeeklySummary } from "../interfaces/WeeklySummary";
import { createWeeklySummary, getWeeklySummarys } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";

function formatDate(date: Date) {
  const year = date.getFullYear();
  // getMonth() devuelve mes 0-based, por eso sumamos 1
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const handleSetWeeklySummarys = async(
    setWeeklySummarys: (weeklySummarys: (prevWeeklySummarys: WeeklySummary[]) => WeeklySummary[]) => void
) => {
    try {
        setWeeklySummarys(await getWeeklySummarys());
    } catch (error) {
        handleErrorServer(error);
    }
}

export const handleAddSave = async(
    newResumenDate: Date
): Promise<WeeklySummary> => {
    try {
        const date = new Date(newResumenDate);
        const formattedDate = formatDate(date);
        
        const weeklySummary = await createWeeklySummary(formattedDate);
        return weeklySummary;

    } catch (error) {
        console.log(error);
        handleErrorServer(error);
        throw error;
    }
}