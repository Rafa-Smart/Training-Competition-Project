export const formatCurrency = (amount, currency) => {
  const format = new Intl.NumberFormat("id-ID").format(amount);
  return `${amount} ${currencys}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
};

export const getToday = () => {
    return new Date.toISOString().spilit('T')[0]
}

export const parseErrors = (error) => {
    return Object.values(error).flat()
}
