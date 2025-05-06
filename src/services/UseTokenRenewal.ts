import { useEffect } from "react";
import axios from "axios";

const useTokenRenewal = ( navigate: any ) => {
    useEffect(() => {
        const renewToken = async() => {
            const token = localStorage.getItem('token');
            if ( !token ) navigate('/');

            try {
                const response = await axios.get(
                    'http://localhost:3000/api/auth/check-auth-status',
                    {
                        headers: {
                            Authorization: `Bearer ${ token }`,
                        },
                    }
                );

                const name = `${ response.data.name } ${ response.data.surname }`;

                localStorage.setItem('token', response.data.token );
                localStorage.setItem('user', name );

            } catch ( error ) {
                

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                navigate('/');
            }
        };

        renewToken();

    }, [ navigate ]);

}

export default useTokenRenewal;