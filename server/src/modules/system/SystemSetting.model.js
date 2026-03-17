const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    systemName: { type: String, default: "Finance Management System" },
    currencySymbol: { type: String, default: "NPR." },
    
    // Store as "2081/82" for display
    fiscalYearBS: { type: String, required: true },
    
    // List of all valid fiscal years for the system
    availableFiscalYears: [{ type: String }],
    
    // Exact AD range for the CURRENT/ACTIVE period to filter database queries correctly
    startDateAD: { type: Date, required: true }, 
    endDateAD: { type: Date, required: true },

    taxSettings: {
        vatRate: { type: Number, default: 13 },
        panNumber: { type: String },
        tdsRates: {
            rent: { type: Number, default: 10 },
            consultancy: { type: Number, default: 1.5 },
            salary: { type: Number, default: 1 }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);