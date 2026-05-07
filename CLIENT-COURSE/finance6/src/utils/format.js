const formatCurrency = (amount, code = "IDR") => {
  const amout = new Intl.NumberFormat("id-ID").format(amount);
  return `${code} ${amount}`;
};
const formatDate = (stringDate) => {
  const date = new Date(stringDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
const getToday = () => {
  return new Date().toISOString().split("T")[0];
};
const parseErrors = (error) => {
  return Object.values(error).flat();
};
export { formatCurrency, formatDate, getToday, parseErrors };
