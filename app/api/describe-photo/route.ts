import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CATEGORIES = ['Surfboards', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Fishing Gear', 'Camping Gear', 'Bundles', 'Other'];

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `You are helping a gear owner list their item on TideShare, a peer-to-peer gear rental marketplace in Charleston, SC for tourists.

Look at this photo and respond with ONLY valid JSON in this exact format:
{
  "title": "short descriptive title (e.g. 'Soft-top Surfboard 7ft' or 'Callaway Golf Club Set')",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "description": "2-3 sentence description highlighting condition, what's included, and why it's great for Charleston/beach visitors. Friendly, specific tone."
}

No extra text, just the JSON.`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(text);

    return NextResponse.json({
      title: parsed.title || '',
      category: CATEGORIES.includes(parsed.category) ? parsed.category : '',
      description: parsed.description || '',
    });
  } catch (err: any) {
    console.error('Describe photo error:', err);
    return NextResponse.json({ error: err.message || 'Failed to analyze photo' }, { status: 500 });
  }
}
