export const formatCurrency = (currency, amount) => {
    return Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}