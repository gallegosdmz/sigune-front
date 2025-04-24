import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPanel from "../pages/Login";
import ProtectedRoute from "./ProtectedRoutes";
import HRPanel from "../pages/RH/Panel";
import ScriptPanel from "../pages/Script/Panel";
import ListScript from "../components/script/ListScript";
import AxuliaresPanel from "../pages/Script/Panel-Axuliares";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPanel />} />
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
                path="/panel-auxiliares"
                element={
                    <ProtectedRoute>
                        <AxuliaresPanel />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;
