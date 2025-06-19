import { useState, useEffect } from 'react';
import { getSystemStatus, closeSystem, openSystem } from '../services/ApiCalls';
import { message } from 'antd';

export const useSystemStatus = () => {
    const [isSystemOpen, setIsSystemOpen] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

    const checkSystemStatus = async () => {
        try {
            setCheckingStatus(true);
            const roles = await getSystemStatus();
            // Buscar el rol REPORTERO
            const reporteroRole = roles.find((role: any) => role.name === 'REPORTERO');
            const hasCreateUpdatePermissions = reporteroRole && reporteroRole.permissions &&
                reporteroRole.permissions.includes('create_content') &&
                reporteroRole.permissions.includes('update_content');
            setIsSystemOpen(!!hasCreateUpdatePermissions);
        } catch (error) {
            console.error('Error checking system status:', error);
            message.error('Error al verificar el estado del sistema');
        } finally {
            setCheckingStatus(false);
        }
    };

    const toggleSystem = async () => {
        try {
            setLoading(true);
            if (isSystemOpen) {
                await closeSystem();
                message.success('Sistema cerrado exitosamente');
                setIsSystemOpen(false);
            } else {
                await openSystem();
                message.success('Sistema abierto exitosamente');
                setIsSystemOpen(true);
            }
        } catch (error) {
            console.error('Error toggling system:', error);
            message.error('Error al cambiar el estado del sistema');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSystemStatus();
    }, []);

    return {
        isSystemOpen,
        loading,
        checkingStatus,
        toggleSystem,
        checkSystemStatus
    };
}; 