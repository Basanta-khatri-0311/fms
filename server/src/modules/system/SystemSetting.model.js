const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    systemName: { type: String, default: "Finance Management System" },
    logoUrl: { type: String },
    currencySymbol: { type: String, default: "NPR." },
    
    // Branding & Contact (Used in Invoices/Reports)
    orgDetails: {
      address: { type: String },
      phone: { type: String },
      email: { type: String },
      website: { type: String },
      slogan: { type: String }
    },

    // Store as "2081/82" for display
    fiscalYearBS: { type: String, required: true },
    
    // List of all valid fiscal years for the system with their date ranges
    availableFiscalYears: [{
        year: { type: String, required: true },
        startDateAD: { type: Date },
        endDateAD: { type: Date }
    }],
    
    // CURRENT active period dates (synced with the active fiscalYearBS)
    startDateAD: { type: Date, required: true }, 
    endDateAD: { type: Date, required: true },

    // Financial Configuration
    taxSettings: {
        vatRate: { type: Number, default: 13 },
        panNumber: { type: String },
        tdsRates: {
            rent: { type: Number, default: 10 },
            consultancy: { type: Number, default: 1.5 },
            salary: { type: Number, default: 1 }
        }
    },

    // Flexible Document Management
    documentSettings: {
        invoicePrefix: { type: String, default: "INV" },
        billPrefix: { type: String, default: "EXP" },
        nextInvoiceNum: { type: Number, default: 1 },
        nextBillNum: { type: Number, default: 1 }
    },

    // Operational Controls
    controls: {
        allowBackdatedEntries: { type: Boolean, default: true },
        auditLockDate: { type: Date }, // No edits before this date
        autoApprovalLimit: { type: Number, default: 0 }, // Transactions below this amount auto-approve
        timezone: { type: String, default: "Asia/Kathmandu" }
    },

    // Branch Management
    branches: {
        type: [{
            name: { type: String, required: true },
            code: { type: String, required: true }, 
            address: { type: String },
            active: { type: Boolean, default: true }
        }],
        default: []
    }
}, { timestamps: true });


module.exports = mongoose.model('SystemSetting', SystemSettingSchema);