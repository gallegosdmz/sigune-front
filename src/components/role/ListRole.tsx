import { Modal } from "antd";
import { Role } from "../../interfaces/Role"

type Props = {
    role: Role | null,
    modalViewRole: boolean,
    setModalViewRole: ( modalViewRole: boolean ) => void,
}

const ListRole: React.FC<Props> = ({ role, modalViewRole, setModalViewRole }) => {

    let department;

    if ( typeof role?.department === 'object' ) {
        department = role.department.name;
    }
    
    return (
        <Modal
            title="Detalles del Puesto"
            open={ modalViewRole }
            onCancel={() => setModalViewRole( false )}
            footer={[]}
            >
            {role && (
                <>
                    <p>
                        <strong>Nombre:</strong> { role.name }
                    </p>
                    <p>
                        <strong>Departamento:</strong> { department }
                    </p>
                </>
            )}
        </Modal>
    );
}

export default ListRole;