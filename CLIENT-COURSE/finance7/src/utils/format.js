export const formatCurrency = (amount, currencyCode) => {
  const format = new Intl.NumberFormat("id-ID").format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
export const parseErrors=(err) => {
    return Object.values(err).flat()
}

export const getToday = () => {
    return new Date().toISOString().split("T")[0]
}