import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export const initializeAI = (apiKey) => {
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        localStorage.setItem('presentb-api-key', apiKey);
        return true;
    }
    return false;
};

export const getStoredApiKey = () => {
    return localStorage.getItem('presentb-api-key') || '';
};

export const isAIConfigured = () => {
    return genAI !== null;
};

// Initialize from stored key on load
const storedKey = getStoredApiKey();
if (storedKey) {
    initializeAI(storedKey);
}

const SLIDE_GENERATION_PROMPT = `You are an elite presentation designer. Create STUNNING, VISUALLY RICH presentation slides.

CRITICAL RULES:
1. The slide background is WHITE (#ffffff) - design content accordingly
2. ALL text MUST be readable - use proper contrast (dark text on light backgrounds, light text on dark elements)
3. Respond with ONLY valid JSON, no markdown

OUTPUT FORMAT:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "content": "<div style='...'>Rich HTML with inline styles, animations, gradients, icons</div>",
      "notes": "Speaker notes"
    }
  ]
}

Create beautiful, professional slides with:
- Creative layouts, gradients, cards, shadows
- Engaging typography and visual hierarchy
- CSS animations for dynamic effects
- Emojis and icons for visual appeal
- Include <style> tag with @keyframes for animations

Generate 12-16 visually impressive slides. Be CREATIVE!`;


export const generatePresentation = async (topic, context = []) => {
    if (!genAI) {
        throw new Error('AI not configured. Please set your Google AI Studio API key.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Build context from description and instructions
    const contextText = context.filter(s => s.trim()).join('\n\n');
    const userPrompt = `
Topic: ${topic}
${contextText ? `\nAdditional Context:\n${contextText}` : ''}

Create a stunning, visually rich presentation on this topic.`;

    try {
        const result = await model.generateContent([
            { text: SLIDE_GENERATION_PROMPT },
            { text: userPrompt }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const data = JSON.parse(text);

        if (!data.slides || !Array.isArray(data.slides)) {
            throw new Error('Invalid response format from AI');
        }

        // Transform to our slide format
        const slides = data.slides.map((slide, index) => ({
            id: crypto.randomUUID(),
            title: slide.title || `Slide ${index + 1}`,
            content: slide.content || '<p>No content generated</p>',
            notes: slide.notes || '',
            layout: index === 0 ? 'title' : 'default',
        }));

        return {
            title: data.title || topic,
            slides,
        };
    } catch (error) {
        console.error('AI Generation Error:', error);
        if (error.message.includes('API key')) {
            throw new Error('Invalid API key. Please check your Google AI Studio API key.');
        }
        throw new Error(`Failed to generate presentation: ${error.message}`);
    }
};

export const regenerateSlide = async (slideTitle, presentationTopic = '', instructions = '') => {
    if (!genAI) {
        throw new Error('AI not configured. Please set your Google AI Studio API key.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are an elite presentation designer. Create a SINGLE stunning slide.

CRITICAL RULES:
1. Background is WHITE (#ffffff)
2. ALL text MUST be readable - proper contrast
3. Respond with ONLY valid JSON

OUTPUT FORMAT:
{
  "title": "Slide Title",
  "content": "<div style='...'>Rich HTML with inline styles, animations, gradients</div>",
  "notes": "Speaker notes"
}

Create ONE beautiful slide with:
- Creative layout, gradients, cards, shadows
- Engaging typography and visual hierarchy
- CSS animations (@keyframes in <style> tag)
- Emojis and icons for visual appeal

Slide Topic: "${slideTitle}"
${presentationTopic ? `Presentation Context: ${presentationTopic}` : ''}
${instructions ? `Special Instructions: ${instructions}` : ''}

Generate ONE visually impressive slide. Be CREATIVE!`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const data = JSON.parse(text);

        return {
            title: data.title || slideTitle,
            content: data.content || '<p>No content generated</p>',
            notes: data.notes || '',
        };
    } catch (error) {
        console.error('AI Slide Regeneration Error:', error);
        throw new Error(`Failed to regenerate slide: ${error.message}`);
    }
};

export default {
    initializeAI,
    getStoredApiKey,
    isAIConfigured,
    generatePresentation,
    regenerateSlide,
};
