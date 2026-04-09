export const formatAmountFromLakhs = (valueInLakhs: number, decimals = 1): string => {
  const safe = Number.isFinite(valueInLakhs) ? valueInLakhs : 0;
  if (Math.abs(safe) >= 100) {
    return `₹${(safe / 100).toFixed(decimals)}Cr`;
  }
  return `₹${safe.toFixed(decimals)}L`;
};

export const formatAmountFromRupees = (valueInRupees: number, decimals = 1): string => {
  const lakhs = (Number.isFinite(valueInRupees) ? valueInRupees : 0) / 100000;
  return formatAmountFromLakhs(lakhs, decimals);
};

export const parseLakhsString = (value: string): number => {
  const num = parseFloat(value.replace(/[₹L,]/g, ""));
  return Number.isNaN(num) ? 0 : num;
};
