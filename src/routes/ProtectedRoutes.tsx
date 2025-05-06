import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC< ProtectedRouteProps > = ({ children }) => {
    const { isAuthenticated, loading } = useContext( AuthContext );

    if ( loading ) {
        // Mostrar un spinner o un mensaje mientras se verifica el estado de autenticación

        return <div>Loading....</div>
    }

    if ( !isAuthenticated ) {
        // Redirigir si no está autenticado después de la verificación
        return <Navigate to="/" replace />;
    }

    // Si está autenticado, renderiza los children (el contenido protegido)
    return children;
}

export default ProtectedRoute;