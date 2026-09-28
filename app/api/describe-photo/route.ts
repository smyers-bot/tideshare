import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CATEGORIES = ['Surfboards', 'Golf Clubs', 'Kayaks', 'Beach Chairs', 'Paddleboards', 'Bikes', 'Fishing Gear', 'Camping Gear', 'Bundles', 'Other'];

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            {
              type: 'text',
              text: `Look carefully at this photo and identify the SPECIFIC item shown. Do not guess or assume — only describe what you can actually see.

This item will be listed for rent on TideShare, a gear rental marketplace in Charleston, SC. Pick the closest matching category from: ${CATEGORIES.join(', ')}.

Respond with ONLY valid JSON, no markdown, no extra text:
{
  "title": "specific name of the item you see (brand + model if visible, e.g. 'Callaway Rogue Driver' or 'Lifetime Kayak 10ft')",
  "category": "closest matching category from the list above",
  "description": "2-3 sentences about the specific item in the photo — condition, what's included, why it's useful for visitors. Be accurate to what you see."
}`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    // Replace literal control characters (newlines, tabs) inside JSON string values
    const sanitized = text.replace(/[\x00-\x1F\x7F]/g, ' ');
    const parsed = JSON.parse(sanitized);

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
