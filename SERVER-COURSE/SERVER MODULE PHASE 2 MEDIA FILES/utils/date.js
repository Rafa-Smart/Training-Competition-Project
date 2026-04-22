export const formatDate = (dateStr) => {
    const date = new Date(dateStr)

    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des']