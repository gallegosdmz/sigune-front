import { Avatar, Popover } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd/es/radio";

export default function TopNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const userRole = localStorage.getItem('role');

    const logout = () => {
        navigate('/');
    }

    return (
        <div className="h-16 px-5 flex flex-row items-center justify-between shadow-lg">
          <div className="flex-1">
            {userRole !== '1' && (
              <div className="flex justify-center">
                <img alt="Logo" className="h-10" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Popover
              placement="bottomRight"
              trigger="click"
              content={
                <div>
                  <div>Sin Notificaciones</div>
                </div>
              }
            >
              <BellOutlined className="text-xl text-slate-500 cursor-pointer" />
            </Popover>
            <Popover
              placement="bottomRight"
              trigger="click"
              content={
                <div className="flex flex-col gap-2">
                  <Button
                    className="text-red-500"
                    onClick={logout}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              }
            >
              <Avatar icon={<UserOutlined />} className="cursor-pointer" />
            </Popover>
          </div>
        </div>
      );
}