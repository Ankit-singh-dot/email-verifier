import express from "express";
import cors from "cors";
import dns from "dns/promises";
import net from "net";
import smtpRoutes from "./routes/api.js"; // update path
import { scrapeLinkedInProfile } from "./api/linkedInScrapper.js";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer";
import { parse } from "url";
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", smtpRoutes);

function isValidEmailFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

app.get("/", (req, res) => {
  res.send({
    activeStatus: true,
  });
});

app.post("/verify", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ valid: false, reason: "Email is required" });

  if (!isValidEmailFormat(email))
    return res
      .status(400)
      .json({ valid: false, reason: "Invalid email format" });

  const domain = email.split("@")[1];

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords.length === 0)
      return res
        .status(400)
        .json({ valid: false, reason: "No MX records found" });

    const smtpResult = await verifySMTP(email);
    return res.json(smtpResult);
  } catch (err) {
    console.error("Error verifying email:", err);
    return res
      .status(400)
      .json({ valid: false, reason: "Domain does not exist or SMTP failed" });
  }
});

app.post("/api/linkedin", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  const data = await scrapeLinkedInProfile(url);
  if (!data) return res.status(500).json({ error: "Failed to scrape" });

  res.json(data);
});



export default app;






