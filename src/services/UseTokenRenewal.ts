import { useEffect } from "react";
import axios from "axios";

const useTokenRenewal = ( navigate: any ) => {
    useEffect(() => {
        const renewToken = async() => {
            try {
                const token = localStorage.getItem('token');
                if ( !token ) navigate('/');

                const response = await axios.get(
                    'http://82.25.93.144/api/auth/check-auth-status',
                    {
                        headers: {
                            Authorization: `Bearer ${ token }`,
                        },
                    }
                );

                console.log( response );

                const name = `${ response.data.name } ${ response.data.surname }`;

                localStorage.setItem('token', response.data.token );
                localStorage.setItem('user', name );

            } catch ( error ) {
                console.log('Error al renovar el token: ', error );

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                navigate('/login');
            }
        };

        renewToken();

    }, [ navigate ]);

}

export default useTokenRenewal;