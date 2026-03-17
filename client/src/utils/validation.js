/**
 * Validation utility for the Finance Management System
 */

// Regex patterns
export const VALIDATION_PATTERNS = {
    // Name: Start with letter, allow spaces, dots, hyphens
    NAME: /^[a-zA-Z][a-zA-Z\s.-]{2,}$/,
    // Email: Standard email regex
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Password: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    // Phone: Start with 9, exactly 10 digits
    PHONE: /^9\d{9}$/,
    // PAN: Exactly 9-digit number
    PAN: /^\d{9}$/,
    // Financial: Positive numbers only, up to 2 decimal places, no 'e' notation
    AMOUNT: /^\d+(\.\d{1,2})?$/
};

export const validateField = (type, value) => {
    if (!value) return { isValid: false, message: 'This field is required' };

    switch (type) {
        case 'name':
            return {
                isValid: VALIDATION_PATTERNS.NAME.test(value),
                message: 'Name must be at least 3 characters and start with a letter'
            };
        case 'email':
            return {
                isValid: VALIDATION_PATTERNS.EMAIL.test(value),
                message: 'Please enter a valid email address'
            };
        case 'password':
            return {
                isValid: VALIDATION_PATTERNS.PASSWORD.test(value),
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)'
            };
        case 'phone':
            return {
                isValid: VALIDATION_PATTERNS.PHONE.test(value),
                message: 'Phone number must start with 9 and be exactly 10 digits'
            };
        case 'pan':
            return {
                isValid: VALIDATION_PATTERNS.PAN.test(value),
                message: 'PAN must be exactly 9 digits'
            };
        case 'amount':
            const num = parseFloat(value);
            if (isNaN(num)) return { isValid: false, message: 'Invalid number' };
            if (num < 0) return { isValid: false, message: 'Amount cannot be negative' };
            // Check for 'e' in scientific notation if it's a string from input
            if (String(value).toLowerCase().includes('e')) return { isValid: false, message: 'Scientific notation not allowed' };
            return {
                isValid: VALIDATION_PATTERNS.AMOUNT.test(String(value)),
                message: 'Please enter a valid amount (up to 2 decimal places)'
            };
        default:
            return { isValid: true, message: '' };
    }
};

/**
 * Prevents 'e', 'E', '+', '-' in number inputs
 */
export const handleNumberKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
};
