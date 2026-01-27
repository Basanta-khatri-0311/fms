exports.getCurrentFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // January is 0

    // If month is July (7) or later, we are in the first half of the new FY
    // If month is June (6) or earlier, we are in the second half of the FY
    if (currentMonth >= 7) {
        return `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
    } else {
        return `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
    }
};