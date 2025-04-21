export const validateEmail = ( _: any, value: string ): Promise< void > => {
    const regex = /^[^\s@]+@(radiotamaulipas\.gob\.mx|tamaulipas\.gob\.mx)$/;

    if ( !regex.test( value ) ) return Promise.reject('El correo debe ser válido y pertenecer a @radiotamaulipas.gob.mx o @tamaulipas.gob.mx');
    
    return Promise.resolve();
}
