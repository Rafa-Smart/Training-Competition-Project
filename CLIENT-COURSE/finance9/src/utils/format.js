const formatDate=(dateString) => {
    const date = new Date(dateString+'T00:00:00').toLocaleDateString('en-US',{
        month:'short',
        year:'numeric',
        day:'numeric'
    })
}

const parseErrors = (err) => {
    if(!err)return [];
    return Object.values(err).flat();
}

const getToday = () => {
    return new Date().toISOString().split('T')[0];
}

const formatCurrency = (amount, code) => {
    const uang = new Intl.NumberFormat('id-ID').format(amount);
    return `${code} ${amount}`
}

export {
    getToday,
    formatCurrency,
    formatDate,
    parseErrors
}