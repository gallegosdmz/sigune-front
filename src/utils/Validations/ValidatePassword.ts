export const validatePassword = ( _: any, value: string ): Promise< void > => {
    if ( !value ) return Promise.reject('La clave es requerida');
    if ( value.length < 8 ) return Promise.reject('La clave debe ser mayor a 8 dígitos');

    return Promise.resolve();
}
