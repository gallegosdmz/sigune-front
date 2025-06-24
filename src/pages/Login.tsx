import { Button, Card, Form, Input, message } from "antd";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CreditCardOutlined, SecurityScanOutlined } from "@ant-design/icons";
import { fetchLogin } from "../services/ApiCalls";
import { validateEmail } from "../utils/Validations/ValidateEmail";
import { validatePassword } from "../utils/Validations/ValidatePassword";

interface LoginData {
    email: string;
    password: string;
}

const LoginPanel: React.FC = () => {
    const [form] = Form.useForm();
    const { loginUser } = useContext( AuthContext );
    const navigate = useNavigate();

    // Reedireción en caso de que ya exista autenticación
    useEffect(() => {
        if ( localStorage.getItem('token') && localStorage.getItem('typeUser') ) navigate('/panel-guion', { replace: true });
        if ( localStorage.getItem('token') && localStorage.getItem('typeUser') === 'editor_user' ) navigate('/panel-guion', { replace: true });
        if ( localStorage.getItem('token') && localStorage.getItem('typeUser') === 'locutor_user' ) navigate('/panel-newsletters', { replace: true });
        if ( localStorage.getItem('token') && localStorage.getItem('typeUser') === 'reportero_user' ) navigate('/panel-reporteros', { replace: true });
    }, []);

    const onFinish = async ( values: LoginData ) => {
        const data = await fetchLogin( values.email, values.password );

        if ( data.error ) {
            if ( data.message.includes('email') ) message.error('El correo es incorrecto');
            if ( data.message.includes('password') ) message.error('La contraseña es incorrecta');
        }
        
        if ( data.token ) {
            loginUser( data.token );

            message.success('¡Bienvenido!');

            if ( data.role.permissions.includes('admin_user') ) {
                navigate('/panel-guion', { replace: true });
                localStorage.setItem('typeUser', 'admin_user');
            } else if (data.role.permissions.includes('view_scripts')) {
                navigate('/panel-guion', { replace: true });
                localStorage.setItem('typeUser', 'editor_user');
            } else if (data.role.permissions.includes('view_newsletters')) {
                navigate('/panel-newsletters', { replace: true });
                localStorage.setItem('typeUser', 'locutor_user');
            } else if (data.role.permissions.includes('delete_script') && data.role.permissions.includes('view_contents')) {
                navigate('/panel-contents', { replace: true });
                localStorage.setItem('typeUser', 'auxiliar_user');
            } else {
                navigate('/panel-reporteros', { replace: true });
                localStorage.setItem('typeUser', 'reportero_user');
            }
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh', // Altura total de la ventana
                backgroundColor: '#f0f2f5', // Fondo claro para mayor contraste
            }}
        >
            <Card
                title="Accede al SIGUNE"
                style={{
                    width: 400,
                    textAlign: 'center',
                }}
            >
                <Form
                    form={form}
                    name="loginForm"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        label="Correo Institucional"
                        rules={[
                            { required: true, message: 'Por favor ingresa tu correo institucional' },
                            { validator: validateEmail }
                        ]}
                    >
                        <Input prefix={<CreditCardOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Contraseña"
                        
                        rules={[
                            { required: true, message: 'Por favor ingresa tu contraseña' },
                            { validator: validatePassword }
                        ]}
                    >
                        <Input.Password prefix={<SecurityScanOutlined />}/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Acceder
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPanel;
