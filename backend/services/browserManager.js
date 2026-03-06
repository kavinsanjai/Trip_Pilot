import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply stealth plugin to avoid detection on travel sites
chromium.use(StealthPlugin());

export class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--ignore-certificate-errors',
        // '--enable-features=Vulkan',
        // '--ignore-gpu-blocklist',
        // '--enable-gpu-rasterization',
      ],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    this.page = await this.context.newPage();

    console.log('🌐 Browser launched (1280×720 viewport)');
  }

  async captureScreenshot() {
    if (!this.page) {
      throw new Error('Browser not initialized — call init() first');
    }

    const buffer = await this.page.screenshot({
      type: 'jpeg',
      quality: 70,
      fullPage: false,
    });

    return buffer.toString('base64');
  }

  async executeAction(action) {
    if (!this.page) {
      throw new Error('Browser not initialized — call init() first');
    }

    switch (action.type) {
      case 'click':
        await this.page.mouse.click(action.x, action.y);
        break;

      case 'type':
        await this.page.keyboard.type(action.text);
        break;

      case 'enter':
        await this.page.keyboard.press('Enter');
        break;

      case 'scroll':
        await this.page.mouse.wheel(0, action.direction === 'up' ? -400 : 400);
        break;

      case 'goto':
        await this.page.goto(action.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        break;

      case 'back':
        await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
        break;

      case 'wait':
        await this.page.waitForTimeout(action.ms || 3000);
        break;

      default:
        console.warn(`⚠️ Unknown action type: ${action.type}`);
    }
  }

  async getPageText(maxLength = 2000) {
    if (!this.page) return '';
    try {
      const text = await this.page.evaluate(() => {
        const body = document.body?.innerText || '';
        return body;
      });
      return text.slice(0, maxLength);
    } catch {
      return '';
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('🌐 Browser closed');
    }
  }
}
