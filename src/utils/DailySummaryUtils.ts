import { message } from "antd";
import { DailySummary } from "../interfaces/DailySummary";
import { createDailySummary, getDailySummarys } from "../services/ApiCalls";
import { handleErrorServer } from "./Custom/CustomErrors";

function formatDate(date: Date) {
  const year = date.getFullYear();
  // getMonth() devuelve mes 0-based, por eso sumamos 1
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const handleSetDailySummarys = async(
    setDailySummarys: (dailySummarys: (prevDailySummarys: DailySummary[]) => DailySummary[]) => void
) => {
    try {
        setDailySummarys(await getDailySummarys());
    } catch (error) {
        handleErrorServer(error);
    }
}

export const handleAddSave = async(
    selectedRowKeys: any[],
    setDailySummarys: (dailySummarys: (prevDailySummarys: DailySummary[]) => DailySummary[]) => void,
    setModalResumen: (modalResumen: boolean) => void,
    newResumenId: number,
) => {
    try {
        if (!Number.isInteger(newResumenId)) {
            throw new Error('El ID del resumen semanal debe ser un número entero');
        }
    
        const today  = new Date();
        const payload = {
            date: formatDate(today), 
            contents: selectedRowKeys.map((item) => Number(item.key)).filter((id) => !isNaN(id)),
            weeklySummary: newResumenId,
        };

        console.log(payload)

        await createDailySummary(payload);

        setDailySummarys(await getDailySummarys());

        message.success('Resumen diario creado exitosamente');
        setModalResumen(false);

    } catch (error) {
        console.log(error)
        handleErrorServer(error);
    }
}