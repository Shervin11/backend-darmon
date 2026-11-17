import { ServiceUnavailableException } from '@nestjs/common';

const PROMPT = `You are a medical diploma verification expert. Determine if the uploaded image is an official diploma, degree, or certificate for a healthcare professional (doctor, pharmacist, nurse, dentist, etc.).

IMPORTANT RULES:
1. The diploma can be in ANY language (e.g., Russian, Tajik, English). Bilingual diplomas (e.g., Tajik/Russian) are extremely common and MUST BE ACCEPTED.
2. It will likely contain HANDWRITTEN text. This is normal and authentic.
3. Accept any medical/healthcare field (e.g., "Фармация" / Pharmacy, "Лечебное дело", "Педиатрия", etc.).
4. Do NOT reject just because it looks old, has handwritten parts, or is in multiple languages. If you see words like "ДИПЛОМ", "DIPLOMA", and it relates to a medical/pharmacy university, ACCEPT it.

Respond strictly with valid JSON without any markdown formatting:
{
  "is_valid": true,
  "confidence_score": 0.9,
  "reason": "short explanation"
}`;

export interface DiplomaVerdict {
  valid: boolean;
  reason: string;
}

/** Asks the Groq vision model whether the image is a medical diploma. */
export async function verifyDiploma(dataUrl: string): Promise<DiplomaVerdict> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ServiceUnavailableException(
      'Diploma verification is not configured (GROQ_API_KEY)',
    );
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:
        process.env.GROQ_VISION_MODEL ||
        'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });
  if (!res.ok) {
    console.error('Groq vision error:', await res.text());
    throw new ServiceUnavailableException('AI verification service error');
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content || '';
  let verdict: {
    is_valid?: unknown;
    confidence_score?: unknown;
    reason?: string;
  };
  try {
    verdict = JSON.parse(
      reply
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim(),
    );
  } catch {
    console.error('Unparseable diploma verdict:', reply);
    throw new ServiceUnavailableException(
      'AI verification returned an invalid answer',
    );
  }

  const saysValid = ['true', 'yes', '1'].includes(
    String(verdict.is_valid).toLowerCase().trim(),
  );
  // Low confidence (20%+) is accepted because diplomas are often handwritten
  const confidence = Number(verdict.confidence_score);
  const valid = saysValid && (isNaN(confidence) || confidence >= 0.2);
  return { valid, reason: verdict.reason || '' };
}
