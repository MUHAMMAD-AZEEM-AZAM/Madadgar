import { NextRequest, NextResponse } from 'next/server';
import { GeminiPlaywrightAgent } from '@/lib/gemini-agent';

// Store active agents (use Redis in production)
const activeAgents = new Map<string, GeminiPlaywrightAgent>();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, action } = await request.json();

    // Handle different actions
    if (action === 'close') {
      const agent = activeAgents.get(sessionId);
      if (agent) {
        await agent.close();
        activeAgents.delete(sessionId);
      }
      return NextResponse.json({ status: 'closed' });
    }

    if (action === 'continue') {
      // For continuing after CAPTCHA resolution
      const agent = activeAgents.get(sessionId);
      if (agent) {
        const result = await agent.chat('Please continue with the form filling process.');
        return NextResponse.json({
          status: 'success',
          response: result.response,
          functionCalls: result.functionCalls,
          pausedForHuman: result.pausedForHuman
        });
      }
    }

    // Get or create agent
    let agent = activeAgents.get(sessionId);
    if (!agent) {
      agent = new GeminiPlaywrightAgent(sessionId);
      await agent.initialize();
      activeAgents.set(sessionId, agent);
    }

    // Process chat message
    const result = await agent.chat(message);

    return NextResponse.json({
      status: 'success',
      response: result.response,
      functionCalls: result.functionCalls,
      pausedForHuman: result.pausedForHuman
    });

  } catch (error) {
    console.error('Gemini Agent Error:', error);
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    const agent = activeAgents.get(sessionId);
    if (agent) {
      await agent.close();
      activeAgents.delete(sessionId);
    }
    
    return NextResponse.json({ status: 'closed' });
  } catch (error) {
    console.error('Error closing agent:', error);
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}