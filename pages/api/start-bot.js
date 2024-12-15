export default async function handler(req, res) {
  if (req.method === "POST") {
    const { comments, links } = req.body;

    if (!comments.length || !links.length || links.length > 5) {
      return res.status(400).json({ success: false, error: "Input tidak valid." });
    }

    const logs = [];
    let browser = null;

    try {
      const chrome = await import("chrome-aws-lambda");
      const puppeteer = await import("puppeteer-core");

      // Gunakan hanya chrome-aws-lambda
      const executablePath = await chrome.executablePath;
      console.log("chrome-aws-lambda executablePath:", executablePath);

      browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: executablePath,
        headless: chrome.headless,
      });

      const page = await browser.newPage();

      for (const [index, link] of links.entries()) {
        try {
          console.log(`Navigasi ke ${link}...`);
          await page.goto(link, { waitUntil: "domcontentloaded" });

          console.log("Mencari textarea komentar...");
          await page.waitForSelector("textarea.comment-box", { timeout: 10000 });

          const randomComment = comments[Math.floor(Math.random() * comments.length)];
          console.log(`Mengetik komentar: ${randomComment}`);
          await page.type("textarea.comment-box", randomComment);
          await page.keyboard.press("Enter");

          logs.push(`Komentar berhasil di ${link}`);
        } catch (err) {
          logs.push(`Gagal di ${link}: ${err.message}`);
        }

        if (index < links.length - 1) {
          console.log("Menunggu 2 menit sebelum lanjut...");
          await new Promise((resolve) => setTimeout(resolve, 120000));
        }
      }
    } catch (err) {
      console.error("Error utama:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }

    res.status(200).json({ success: true, logs });
  } else {
    res.status(405).json({ success: false, error: "Method not allowed." });
  }
}