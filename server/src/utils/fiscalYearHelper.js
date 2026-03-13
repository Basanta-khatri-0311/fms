// Example helper to find current FY
// In Nepal, FY 2081/82 started July 16, 2024
export const getFiscalYear = (dateAD) => {
  const year = dateAD.getFullYear();
  const month = dateAD.getMonth() + 1; // JS months are 0-11
  const day = dateAD.getDate();

  // If after July 16, we are in the new FY
  if (month > 7 || (month === 7 && day >= 16)) {
    return `${year}/${year + 1}`; // Simplified for AD logic
  }
  return `${year - 1}/${year}`;
};