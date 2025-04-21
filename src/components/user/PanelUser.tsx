import { Row, Col, Form } from 'antd';
import CreateUser from './CreateUser';
import { useEffect, useState } from 'react';
import { User } from '../../interfaces/User';
import ListUsers from './ListUsers';
import * as UserUtils from '../../utils/UserUtils';
import ListUser from './ListUser';
import EditUser from './EditUser';

const PanelUser: React.FC = () => {

    // STATES
    const [ users, setUsers ] = useState<User[]>([]);
    const [ visibleAdd, setVisibleAdd ] = useState<boolean>( false );
    const [ visibleEdit, setVisibleEdit ] = useState<boolean>( false );

    const [ user, setUser ] = useState<User | null>( null );
    const [ modalView, setModalView ] = useState<boolean>( false );

    // FORMS
    const [ editForm ] = Form.useForm();

    // Asignar Usuarios
    useEffect(() => {
      UserUtils.handleSetUsers( setUsers );
    }, []);

    return (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <CreateUser 
                setUsers={ setUsers }
                setVisibleAdd={ setVisibleAdd }
                visibleAdd={ visibleAdd }
            />

            <EditUser
              user={ user }
              setUsers={ setUsers }
              setVisibleEdit={ setVisibleEdit }
              visibleEdit={ visibleEdit }
              editForm={ editForm }
            />

            <ListUsers
                users={ users }
                setVisibleAdd={ setVisibleAdd }
                setVisibleEdit={ setVisibleEdit }
                setUser={ setUser }
                setUsers={ setUsers }
                setModalView={ setModalView }
                editForm={ editForm }
            />

            <ListUser
                user={ user }
                modalView={ modalView }
                setModalView={ setModalView }
            />
          </Col>
        </Row>
    ); 
}

export default PanelUser;