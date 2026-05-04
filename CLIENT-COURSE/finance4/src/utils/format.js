const formatCurrency = (amount, code) => {
  const amountdata = new Intl.NumberFormat("id-ID").format(amount);
  return `${code} ${amountdata}`;
};

const getToday = () => {
  return new Date.toISOString().split("T")[0];
};

// formatDate("2025-06-07") → "Jun 7, 2025"
const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
};


const parseErrors=(errors)=>{
    if(!errors) return ;
    return Object.values(errors).flat()
}