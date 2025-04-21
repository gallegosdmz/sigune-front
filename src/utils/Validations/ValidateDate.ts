export const validateDate = ( date: string ): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if ( !regex.test( date ) ) return false;

    // Verificar si es una fecha válida
    const parsedDate = new Date( date );
    return parsedDate instanceof Date && !isNaN( parsedDate.getTime() );
}
