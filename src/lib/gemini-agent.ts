import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebAutomationAgent } from './web-agent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define tools/functions that Gemini can call
const tools: any[] = [{
  name: 'navigate_to_website',
  description: 'Navigate to a specific URL in the browser',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to navigate to (can include or exclude https://)'
      }
    },
    required: ['url']
  }
}, {
  name: 'fill_form',
  description: 'Fill out a form on the current webpage with provided data',
  parameters: {
    type: 'object',
    properties: {
      fields: {
        type: 'array',
        description: 'Array of form fields to fill',
        items: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the input field (e.g., #email, input[name="username"], [placeholder="Enter name"])'
            },
            value: {
              type: 'string',
              description: 'The value to enter in the field'
            },
            type: {
              type: 'string',
              enum: ['text', 'select', 'checkbox', 'radio'],
              description: 'Type of the form field'
            }
          },
          required: ['selector', 'value']
        }
      }
    },
    required: ['fields']
  }
}, {
  name: 'click_element',
  description: 'Click on an element on the webpage (buttons, links, etc.)',
  parameters: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the element to click (e.g., button[type="submit"], .submit-btn, #login-button)'
      }
    },
    required: ['selector']
  }
}, {
  name: 'extract_page_info',
  description: 'Extract information from the current webpage',
  parameters: {
    type: 'object',
    properties: {
      info_type: {
        type: 'string',
        enum: ['forms', 'text', 'title', 'url'],
        description: 'Type of information to extract'
      }
    },
    required: ['info_type']
  }
}, {
  name: 'check_for_captcha',
  description: 'Check if there is a CAPTCHA or human verification on the current page',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}, {
  name: 'take_screenshot',
  description: 'Take a screenshot of the current webpage',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}];

export class GeminiPlaywrightAgent {
  private agent: WebAutomationAgent;
  private model: any;
  private conversationHistory: any[] = [];

  constructor(sessionId: string) {
    this.agent = new WebAutomationAgent(sessionId);
    // Initialize Gemini with function calling
    console.log('🔧 Initializing Gemini with tools:', tools.length);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [{ functionDeclarations: tools }],
      toolConfig: {
        functionCallingConfig: {
          mode: 'ANY',
          allowedFunctionNames: tools.map(tool => tool.name)
        }
      },
      generationConfig: {
        temperature: 0.3
      }
    });
  }

  async initialize() {
    await this.agent.initialize({ headless: false });
  }

  // Execute the function called by Gemini
  async executeFunctionCall(functionCall: any) {
    const { name, args } = functionCall;

    try {
      switch (name) {
        case 'navigate_to_website':
          const navResult = await this.agent.navigateTo(args.url);
          return {
            success: navResult.success,
            message: navResult.success 
              ? `Successfully navigated to ${navResult.url}. Page title: ${navResult.title}`
              : `Failed to navigate: ${navResult.error}`,
            currentUrl: navResult.url,
            title: navResult.title
          };

        case 'fill_form':
          const fillResult = await this.agent.fillForm(args.fields);
          if (fillResult.pausedForHuman) {
            return {
              success: false,
              pausedForHuman: true,
              message: fillResult.reason,
              action: 'waiting_for_human'
            };
          }
          return {
            success: fillResult.success,
            message: fillResult.success 
              ? `Successfully filled ${args.fields.length} form fields`
              : `Failed to fill form: ${fillResult.error}`
          };

        case 'click_element':
          await this.agent.clickElement(args.selector);
          return {
            success: true,
            message: `Successfully clicked element: ${args.selector}`
          };

        case 'extract_page_info':
          if (args.info_type === 'forms') {
            const forms = await this.agent.extractFormFields();
            return {
              success: true,
              info: forms,
              message: `Found ${forms.length} form fields on the page`
            };
          } else {
            const content = await this.agent.getPageContent();
            return {
              success: true,
              info: this.extractInfo(content, args.info_type),
              message: `Extracted ${args.info_type} information from the page`
            };
          }

        case 'check_for_captcha':
          const captchaCheck = await this.agent.detectCaptchaOrVerification();
          return {
            detected: captchaCheck.detected,
            type: captchaCheck.type,
            message: captchaCheck.message
          };

        case 'take_screenshot':
          const screenshot = await this.agent.takeScreenshot();
          return {
            success: true,
            screenshot: screenshot,
            message: 'Screenshot taken successfully'
          };

        default:
          return {
            success: false,
            error: `Unknown function: ${name}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: String(error)
      };
    }
  }

  private extractInfo(html: string, type: string) {
    switch (type) {
      case 'text':
        return html.replace(/<[^>]*>/g, '').substring(0, 1000);
      case 'title':
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        return titleMatch ? titleMatch[1] : 'No title found';
      case 'url':
        return 'Current page URL extracted';
      default:
        return 'Info extraction not implemented for this type';
    }
  }

  async chat(userMessage: string): Promise<{
    response: string;
    functionCalls?: any[];
    pausedForHuman?: boolean;
  }> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Enhanced system prompt for Pakistani government forms
    const systemPrompt = `You are Madadgar, a helpful AI assistant for Pakistani government forms and websites. 

CRITICAL INSTRUCTIONS:
- When a user provides a URL (like https://ibcc.edu.pk/attestation-application-process), you MUST immediately call the navigate_to_website function
- When a user says "go to" or "navigate to" a website, you MUST call navigate_to_website function
- When a user asks you to fill forms, you MUST call fill_form function
- When a user asks you to click something, you MUST call click_element function

DO NOT just say you will do something - ACTUALLY CALL THE FUNCTIONS!

Available functions:
- navigate_to_website: Use this when user provides URLs or asks to go to websites
- fill_form: Use this to fill out forms on websites
- click_element: Use this to click buttons or links
- extract_page_info: Use this to get information from current page
- take_screenshot: Use this to show current page
- check_for_captcha: Use this to check for verification

Always call the appropriate function instead of just talking about what you would do.`;

    // Start chat with history
    const chat = this.model.startChat({
      history: this.conversationHistory.slice(0, -1),
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    });

    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    
    console.log('🤖 Gemini response:', response.text());
    console.log('🔧 Function calls available:', response.functionCalls?.length || 0);
    console.log('🔧 Full response object:', JSON.stringify(response, null, 2));

    // Handle function calls
    const functionCalls: any[] = [];
    let finalText = '';
    let pausedForHuman = false;

    while (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      console.log('🔧 Function called:', functionCall.name, functionCall.args);

      // Execute the function
      const functionResult = await this.executeFunctionCall(functionCall);
      console.log('✅ Function result:', functionResult);
      functionCalls.push({
        name: functionCall.name,
        args: functionCall.args,
        result: functionResult
      });

      // Check if paused for human
      if (functionResult.pausedForHuman) {
        pausedForHuman = true;
        finalText = functionResult.message || 'Paused for human interaction';
        break;
      }

      // Send function result back to Gemini
      result = await chat.sendMessage([{
        functionResponse: {
          name: functionCall.name,
          response: functionResult
        }
      }]);
      response = result.response;
    }

    // Get final text response
    if (!pausedForHuman) {
      finalText = response.text();
    }

    // Update conversation history
    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: finalText }]
    });

    return {
      response: finalText,
      functionCalls,
      pausedForHuman
    };
  }

  async close() {
    await this.agent.close();
  }
}