import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPanel from "../pages/Login";
import ProtectedRoute from "./ProtectedRoutes";
import HRPanel from "../pages/RH/Panel";
import ScriptPanel from "../pages/Script/Panel";
import ListScript from "../components/script/ListScript";
import NewsLetterPanel from "../pages/NewsLetter/Panel";
import ReporterosPanel from "../pages/Script/Panel-Reporteros";
import ReportPanel from "../pages/Report/Panel";
import PanelRespaldo from "../components/newsletter/PanelRespaldo";
import ReportPanelMensual from "../pages/Report/Panel-Mensual";
import PanelContents from "../components/contents/PanelContents";
import ListWeeklySummarys from "../components/summary/ListWeeklySummarys";
import WeeklySummaryDetails from "../components/summary/WeeklySummaryDetails";
import DailySummaryDetails from "../components/summary/DailySummaryDetails";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPanel />}/>
            <Route
                path="/panel-rh"
                element={
                    <ProtectedRoute>
                        <HRPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-guion"
                element={
                    <ProtectedRoute>
                        <ScriptPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-guion/:idScript"
                element={
                    <ProtectedRoute>
                        <ListScript />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-reporteros"
                element={
                    <ProtectedRoute>
                        <ReporterosPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-newsletters"
                element={
                    <ProtectedRoute>
                        <NewsLetterPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-reports"
                element={
                    <ProtectedRoute>
                        <ReportPanel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-reports-mensuales"
                element={
                    <ProtectedRoute>
                        <ReportPanelMensual />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-respaldo"
                element={
                    <ProtectedRoute>
                        <PanelRespaldo />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/panel-contents"
                element={
                    <ProtectedRoute>
                        <PanelContents />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/resumenes-semanales"
                element={
                    <ProtectedRoute>
                        <ListWeeklySummarys />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/resumen-semanal/:id"
                element={
                    <ProtectedRoute>
                        <WeeklySummaryDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/resumen-diario/:id"
                element={
                    <ProtectedRoute>
                        <DailySummaryDetails />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;
