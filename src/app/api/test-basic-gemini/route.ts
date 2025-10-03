import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    console.log('🧪 Testing basic Gemini API with message:', message);
    console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API Key length:', process.env.GEMINI_API_KEY?.length || 0);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Basic Gemini response:', text);
    
    return Response.json({
      status: 'success',
      response: text,
      apiKeyExists: !!process.env.GEMINI_API_KEY
    });

  } catch (error) {
    console.error('❌ Basic Gemini Error:', error);
    return Response.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
