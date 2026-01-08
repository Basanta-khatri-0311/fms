const coaService = require('./coa.service');


exports.createAccount = async (req, res) => {
  try {
    const account = await coaService.createAccount(req.body, req.user);
    return res.status(201).json(account);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



exports.getAccounts = async (req, res) => {
  try {
    const accounts = await coaService.getAllAccounts();
    return res.status(200).json(accounts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};