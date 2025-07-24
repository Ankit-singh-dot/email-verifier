const { verifySMTP } = require('../utils/smtpVerifier.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  try {
    const result = await verifySMTP(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'SMTP verification failed', detail: error.message });
  }
}; 