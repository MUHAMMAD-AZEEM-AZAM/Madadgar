import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface FormField {
  selector: string;
  value: string;
  type?: 'text' | 'select' | 'checkbox' | 'radio';
}

export interface NavigationResult {
  success: boolean;
  url: string;
  title?: string;
  error?: string;
}

export interface FormFillResult {
  success: boolean;
  error?: string;
  pausedForHuman?: boolean;
  reason?: string;
}

export interface CaptchaDetection {
  detected: boolean;
  type?: string;
  message: string;
}

export class WebAutomationAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async initialize(options: { headless?: boolean } = { headless: false }) {
    try {
      this.browser = await chromium.launch({ 
        headless: options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      this.page = await this.context.newPage();
      
      // Set up console logging
      this.page.on('console', msg => {
        console.log(`[Browser Console]: ${msg.text()}`);
      });
      
      console.log(`Web agent initialized for session: ${this.sessionId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize web agent:', error);
      throw error;
    }
  }

  async navigateTo(url: string): Promise<NavigationResult> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      console.log(`Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const title = await this.page.title();
      const currentUrl = this.page.url();
      
      return {
        success: true,
        url: currentUrl,
        title
      };
    } catch (error) {
      return {
        success: false,
        url: url,
        error: String(error)
      };
    }
  }

  async fillForm(fields: FormField[]): Promise<FormFillResult> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      // Check for CAPTCHA first
      const captchaCheck = await this.detectCaptchaOrVerification();
      if (captchaCheck.detected) {
        return {
          success: false,
          pausedForHuman: true,
          reason: captchaCheck.message
        };
      }

      for (const field of fields) {
        try {
          console.log(`Filling field: ${field.selector} with value: ${field.value}`);
          
          // Wait for element to be visible
          await this.page.waitForSelector(field.selector, { timeout: 10000 });
          
          switch (field.type) {
            case 'select':
              await this.page.selectOption(field.selector, field.value);
              break;
            case 'checkbox':
              const checkbox = await this.page.locator(field.selector);
              if (field.value.toLowerCase() === 'true' || field.value === '1') {
                await checkbox.check();
              } else {
                await checkbox.uncheck();
              }
              break;
            case 'radio':
              await this.page.click(field.selector);
              break;
            default: // text input
              await this.page.fill(field.selector, field.value);
              break;
          }
          
          // Small delay between fields
          await this.page.waitForTimeout(500);
        } catch (fieldError) {
          console.error(`Error filling field ${field.selector}:`, fieldError);
          return {
            success: false,
            error: `Failed to fill field ${field.selector}: ${fieldError}`
          };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: String(error)
      };
    }
  }

  async clickElement(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.click(selector);
      await this.page.waitForTimeout(1000); // Wait for any navigation or changes
    } catch (error) {
      throw new Error(`Failed to click element ${selector}: ${error}`);
    }
  }

  async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      return await this.page.content();
    } catch (error) {
      throw new Error(`Failed to get page content: ${error}`);
    }
  }

  async detectCaptchaOrVerification(): Promise<CaptchaDetection> {
    if (!this.page) {
      return { detected: false, message: 'Web agent not initialized' };
    }

    try {
      // Common CAPTCHA selectors
      const captchaSelectors = [
        '[class*="captcha"]',
        '[id*="captcha"]',
        '[class*="recaptcha"]',
        '[id*="recaptcha"]',
        'iframe[src*="recaptcha"]',
        '[class*="hcaptcha"]',
        '[id*="hcaptcha"]',
        '[class*="verification"]',
        '[id*="verification"]',
        '.g-recaptcha',
        '#recaptcha',
        '.h-captcha'
      ];

      for (const selector of captchaSelectors) {
        const element = await this.page.locator(selector).first();
        if (await element.isVisible()) {
          return {
            detected: true,
            type: 'captcha',
            message: 'CAPTCHA or human verification detected. Please solve it manually and then continue.'
          };
        }
      }

      // Check for common verification texts
      const verificationTexts = [
        'verify you are human',
        'prove you are not a robot',
        'security check',
        'verification required',
        'captcha'
      ];

      const pageText = await this.page.textContent('body') || '';
      const lowerPageText = pageText.toLowerCase();

      for (const text of verificationTexts) {
        if (lowerPageText.includes(text)) {
          return {
            detected: true,
            type: 'verification',
            message: 'Human verification required. Please complete the verification and then continue.'
          };
        }
      }

      return { detected: false, message: 'No CAPTCHA or verification detected' };
    } catch (error) {
      return { detected: false, message: `Error checking for CAPTCHA: ${error}` };
    }
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      const screenshot = await this.page.screenshot({ 
        type: 'png',
        fullPage: false 
      });
      return screenshot.toString('base64');
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }

  async extractFormFields(): Promise<any[]> {
    if (!this.page) {
      throw new Error('Web agent not initialized');
    }

    try {
      return await this.page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));
        const allFields: any[] = [];

        forms.forEach((form, formIndex) => {
          const inputs = form.querySelectorAll('input, select, textarea');
          inputs.forEach((input: any) => {
            const field = {
              formIndex,
              tagName: input.tagName.toLowerCase(),
              type: input.type || 'text',
              name: input.name || '',
              id: input.id || '',
              placeholder: input.placeholder || '',
              required: input.required || false,
              selector: input.id ? `#${input.id}` : input.name ? `[name="${input.name}"]` : `${input.tagName.toLowerCase()}[type="${input.type}"]`
            };
            allFields.push(field);
          });
        });

        return allFields;
      });
    } catch (error) {
      throw new Error(`Failed to extract form fields: ${error}`);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      console.log(`Web agent closed for session: ${this.sessionId}`);
    } catch (error) {
      console.error('Error closing web agent:', error);
    }
  }
}