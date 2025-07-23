import express from "express";
import { verifySMTP } from "../utils/smtpVerifier.js"; // adjust path as needed

const router = express.Router();

router.post("/verify-smtp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const result = await verifySMTP(email);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "SMTP verification failed", detail: error.message });
  }
});

export default router;
