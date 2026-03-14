const coaService = require('./coa.service');
//create COA
exports.createAccount = async (req, res) => {
  try {
    const account = await coaService.createAccount(req.body, req.user);
    return res.status(201).json(account);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//get all COA
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await coaService.getAllAccounts();
    return res.status(200).json(accounts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//deleting COA account
exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await coaService.deleteAccount(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COA Editing functionality
exports.updateAccount = async (req, res) => {
  try {
    const updated = await coaService.updateAccount(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};