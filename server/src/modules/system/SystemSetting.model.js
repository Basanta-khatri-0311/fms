const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    // Store as "2081/82" for display
    fiscalYearBS: { type: String, required: true },
    
    // Exact AD range to filter database queries correctly
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