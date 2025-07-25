import puppeteer from "puppeteer";

export async function scrapeLinkedInProfile(url) {
  const browser = await puppeteer.launch({
    headless: true, // Set to false to debug with UI
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Pretend to be a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait for profile name to load
    await page.waitForSelector("h1", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const name = document.querySelector("h1")?.innerText?.trim();

      let currentCompany = null;

      const experienceSection = document.querySelector("#experience");
      if (experienceSection) {
        const jobItems = experienceSection.querySelectorAll("li");

        for (const item of jobItems) {
          const text = item.innerText.toLowerCase();
          if (text.includes("present")) {
            const companyElem =
              item.querySelector("span[aria-hidden='true']") ||
              item.querySelector("span.t-14.t-normal");

            const companyText = companyElem?.innerText?.trim();
            if (companyText) {
              currentCompany = companyText;
              break;
            }
          }
        }
      }

      return { name, company: currentCompany };
    });

    const [firstName, ...rest] = data.name?.split(" ") || [];
    const lastName = rest.join(" ");

    return {
      firstName,
      lastName,
      company: data.company,
    };
  } catch (err) {
    console.error("Error scraping LinkedIn:", err.message);
    return null;
  } finally {
    await browser.close();
  }
}
