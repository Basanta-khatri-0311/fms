const SystemSetting = require('./SystemSetting.model');

exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            // Create default if none exists
            settings = await SystemSetting.create({
                fiscalYearBS: "2081/82",
                startDateAD: new Date("2024-07-16"),
                endDateAD: new Date("2025-07-15")
            });
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};