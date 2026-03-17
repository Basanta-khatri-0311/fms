/**
 * Converts a number to words in Indian/Nepali numbering format (Lakhs, Crores)
 * Optimized for currency representation
 */
export const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    if (!num) return '';

    const singles = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 10) return singles[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singles[n % 10] : '');
        if (n < 1000) return singles[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        return '';
    };

    const formatRupees = (n) => {
        let str = '';
        if (n >= 10000000) {
            str += convert(Math.floor(n / 10000000)) + ' Crore ';
            n %= 10000000;
        }
        if (n >= 100000) {
            str += convert(Math.floor(n / 100000)) + ' Lakh ';
            n %= 100000;
        }
        if (n >= 1000) {
            str += convert(Math.floor(n / 1000)) + ' Thousand ';
            n %= 1000;
        }
        if (n > 0) {
            str += convert(n);
        }
        return str.trim();
    };

    const mainPart = Math.floor(num);
    const decimalPart = Math.round((num - mainPart) * 100);

    let result = formatRupees(mainPart) + ' Rupees';
    
    if (decimalPart > 0) {
        result += ' and ' + convert(decimalPart) + ' Paisa';
    }

    return result + ' Only';
};
