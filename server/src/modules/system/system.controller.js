const SystemSetting = require('./SystemSetting.model');

exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            // Create default if none exists
            settings = await SystemSetting.create({
                systemName: "Finance Management System",
                currencySymbol: "NPR.",
                fiscalYearBS: "2081/82",
                availableFiscalYears: [
                    { year: "2081/82", startDateAD: new Date("2024-07-16"), endDateAD: new Date("2025-07-15") },
                    { year: "2082/83", startDateAD: new Date("2025-07-16"), endDateAD: new Date("2026-07-15") },
                    { year: "2083/84", startDateAD: new Date("2026-07-16"), endDateAD: new Date("2027-07-15") }
                ],
                startDateAD: new Date("2024-07-16"),
                endDateAD: new Date("2025-07-15"),
                branches: []
            });
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let updateData = req.body;
        // If it was submitted via FormData
        if (typeof req.body.settings === 'string') {
            updateData = JSON.parse(req.body.settings);
        }

        // Attach new file path if an image was uploaded
        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
        }

        const settings = await SystemSetting.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};