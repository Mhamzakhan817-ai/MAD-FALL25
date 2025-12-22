export const formatPrice = (value) => {
  const num = Number(value);

  if (isNaN(num)) return "Rs. 0";

  return num.toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  });
};
