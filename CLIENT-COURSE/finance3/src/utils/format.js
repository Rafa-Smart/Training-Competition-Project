export const formatCurrency = (amount, currencyCode = 'IDR') =>{
    // dari 250000 bisa jadi 250.000
    const format = new Intl.NumberFormat('id-ID').format(amount);
    return `${currencyCode} ${format}`;
}


export const formatDate = (dateString) => {
    const date = new Date(dateString+'T00:00:00')  // Paksa timezone lokal
    return date.toLocaleDateString('en-US', {
        month:"short",
        year:'numeric',
        day:'numeric'
    });
}



export const parseErrors=(errorObject) => {
    if(!errorObject) return;
    return Object.values(errorObject).flat();
}

// GET TODAY DATE dalam format YYYY-MM-DD (dipakai sebagai default value input date)
export const getTodayDate = () => {
    // jadi kita kan sealu dapatkan date hari ini saat ini tapi dalam format y:m:d
    // kareana di laravelnya itu validasinya pake format ini ya


    // Date.toISOString(): string
    // Returns a date as a string value in ISO format
    return new Date.toISOString().spilt('T')[0]
}