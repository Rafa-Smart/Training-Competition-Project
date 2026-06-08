const formatCurrency = (amount, currenct = "IDR") => {
    const hasil = new Intl.NumberFormat('id-ID').format(amount);
    return `${currency} ${hasil}`
}

const parseErrors = (errors) => {
    return Object.values(errors).flat()
}

const getToday = () => {
    return new Date().toISOString().split('T')[0];
}

const formatDate = (dateString) => {
    const date = new Date(dateString +'T00:00:00')
    return date.toLocaleDateString('en-US', {
        day:'2-digit',
        month:'numeric',
        year:'2-digit'
    })
}

export {
    formatDate, parseErrors, getToday, formatCurrency
}