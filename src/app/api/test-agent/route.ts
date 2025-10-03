import { NextRequest, NextResponse } from 'next/server';
import { GeminiPlaywrightAgent } from '@/lib/gemini-agent';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    console.log('🧪 Testing agent with message:', message);
    
    const agent = new GeminiPlaywrightAgent('test-session');
    await agent.initialize();
    
    const result = await agent.chat(message);
    
    await agent.close();
    
    return NextResponse.json({
      status: 'success',
      response: result.response,
      functionCalls: result.functionCalls,
      pausedForHuman: result.pausedForHuman
    });

  } catch (error) {
    console.error('Test Agent Error:', error);
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
