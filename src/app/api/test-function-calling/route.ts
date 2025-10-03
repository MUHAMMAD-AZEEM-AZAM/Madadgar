import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Simple function declaration
const simpleTools = [{
  name: 'navigate_to_website',
  description: 'Navigate to a specific URL in the browser',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to navigate to'
      }
    },
    required: ['url']
  }
}];

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    console.log('🧪 Testing function calling with message:', message);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [{ functionDeclarations: simpleTools }]
    });
    
    const chat = model.startChat({
      systemInstruction: {
        parts: [{ text: 'You are a helpful assistant. When users ask you to navigate to a URL, you MUST call the navigate_to_website function.' }]
      }
    });
    
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    console.log('🤖 Response text:', response.text());
    console.log('🔧 Function calls:', response.functionCalls?.length || 0);
    
    return Response.json({
      status: 'success',
      response: response.text(),
      functionCalls: response.functionCalls || [],
      functionCallsCount: response.functionCalls?.length || 0
    });

  } catch (error) {
    console.error('❌ Function calling test error:', error);
    return Response.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
