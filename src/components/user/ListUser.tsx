import { Modal } from "antd";
import { User } from "../../interfaces/User";

type Props = {
    user: User | null,
    modalView: boolean,
    setModalView: ( modalView: boolean ) => void,
}

const ListUser: React.FC< Props > = ({ user, modalView, setModalView }) => {

    let role;
    let department;

    if ( typeof user?.role === 'object' ) {
      role = user.role.name;
      department = typeof user.role.department === 'object' ? user.role.department.name : 'No encontrado'; 
    }

    return (
    <Modal
        title="Detalles del Empleado"
        open={ modalView }
        onCancel={() => setModalView( false )}
        footer={[]}
      >
        {user && (
          <>
            <p>
              <strong>Nombre:</strong> { user.name }
            </p>
            <p>
              <strong>Apellidos:</strong> { user.surname }
            </p>
            <p>
              <strong>Correo Institucional:</strong> { user.institucionalEmail }
            </p>
            <p>
              <strong>Puesto:</strong> { role }
            </p>
            <p>
              <strong>Departamento:</strong> { department }
            </p>
            <p>
              <strong>Número de Empleado:</strong> { user.numEmployee }
            </p>
            <p>
              <strong>Telefono:</strong> { user.phone }
            </p>
            <p>
              <strong>Dirección:</strong> { user.address }
            </p>
            <p>
              <strong>CURP:</strong> { user.curp }
            </p>
            <p>
              <strong>RFC:</strong> { user.rfc }
            </p>
            <p>
              <strong>Fecha de Admisión:</strong> { new Date( user.dateAdmission! ).toLocaleDateString('es-ES') }
            </p>
          </>
        )}
      </Modal>
    );
}

export default ListUser;