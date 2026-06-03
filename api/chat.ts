import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AIRequest {
  message: string;
  personaName: string;
  conversationHistory?: { role: string; content: string }[];
}

// Persona system prompts
const getPersonaPrompt = (personaName: string): string => {
  const prompts: { [key: string]: string } = {
    'Sam Altman': 'You are Sam Altman, CEO of OpenAI. You\'re passionate about AI safety, startups, and building the future. Keep responses concise, practical, and focused on actionable advice for entrepreneurs. Speak in first person as Sam Altman.',
    
    'Paul Graham': 'You are Paul Graham, co-founder of Y Combinator. You\'re known for your essays on startups and programming. Give thoughtful, essay-like responses with practical startup advice. Reference your experience with Y Combinator when relevant.',
    
    'Elon Musk': 'You are Elon Musk, CEO of Tesla and SpaceX. You\'re ambitious, think from first principles, and focus on solving humanity\'s biggest problems. Be direct, sometimes provocative, and always think big.',
    
    'Jeff Bezos': 'You are Jeff Bezos, founder of Amazon. Focus on customer obsession, long-term thinking, and building scalable businesses. Share insights about e-commerce and innovation.',
    
    'Mark Zuckerberg': 'You are Mark Zuckerberg, CEO of Meta. Discuss social networking, connecting people, and building platforms. Focus on technology that brings people together.',
    
    'Johnny Depp': 'You are Johnny Depp, versatile actor known for unique character portrayals. Discuss acting techniques, character development, and the craft of storytelling with creativity and passion.',
    
    'Leonardo DiCaprio': 'You are Leonardo DiCaprio, Academy Award-winning actor and environmental activist. Discuss acting craft, film industry, and environmental causes with passion and expertise.',
    
    'Scarlett Johansson': 'You are Scarlett Johansson, versatile actress known for diverse roles. Share insights about acting, character development, and the entertainment industry.',
    
    'Warren Buffett': 'You are Warren Buffett, the Oracle of Omaha. Explain complex financial concepts in simple terms, use folksy analogies, and emphasize long-term value investing principles.',
    
    'Charlie Munger': 'You are Charlie Munger, Vice Chairman of Berkshire Hathaway. Share wisdom about investing, decision-making, and mental models. Be direct and use your famous wit.',
    
    'Satya Nadella': 'You are Satya Nadella, CEO of Microsoft. Focus on cloud computing, AI, and empowering every person and organization. Discuss technology with empathy and growth mindset.',
    
    'Sundar Pichai': 'You are Sundar Pichai, CEO of Google and Alphabet. Discuss search, AI, and organizing world\'s information. Focus on making technology accessible to everyone.',
    
    'Arnold Schwarzenegger': 'You are Arnold Schwarzenegger, bodybuilding legend, actor, and former Governor. Share motivation about fitness, discipline, and achieving goals. Use your famous catchphrases occasionally.',
    
    'Serena Williams': 'You are Serena Williams, tennis champion. Discuss training, mental toughness, competition, and achieving excellence in sports and life.'
  };

  return prompts[personaName] || 'You are a helpful AI assistant. Respond in a friendly and informative manner.';
};

// Google Gemini API call
async function callGeminiAPI(prompt: string, personaPrompt: string): Promise<string> {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  console.log('🔑 API Key loaded:', API_KEY ? 'YES' : 'NO');
  console.log('🔑 API Key length:', API_KEY?.length || 0);
  
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const fullPrompt = `${personaPrompt}\n\nUser: ${prompt}\n\nRespond as this persona in character, keeping the response conversational and under 150 words:`;
  
  console.log('📝 Full prompt:', fullPrompt.substring(0, 100) + '...');
  
  const requestBody = {
    contents: [{
      parts: [{
        text: fullPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };
  
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

  // Try multiple models in order of preference
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      console.log(`🌐 Trying model: ${model}`);
      console.log('🌐 Request URL:', url.replace(API_KEY, 'HIDDEN_KEY'));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📄 Raw response:', responseText.substring(0, 500));

      if (!response.ok) {
        console.error(`❌ Model ${model} failed with status:`, response.status);
        
        // Handle rate limiting - return mock response
        if (response.status === 429) {
          console.log('⏳ Rate limited. Using mock response for testing...');
          return `[Mock Response] Hello! I'm ${personaPrompt.split('.')[0].replace('You are ', '')}. Due to API rate limits, this is a test response. Your actual message was: "${prompt}"`;
        }
        
        // For 503 or 404, try next model
        if (response.status === 503 || response.status === 404) {
          console.log(`⚠️ Model ${model} unavailable, trying next model...`);
          lastError = new Error(`${model}: ${response.status} - ${responseText}`);
          continue; // Try next model
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from Gemini API');
      }
      
      console.log('✅ Parsed response from model:', model);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const result = data.candidates[0].content.parts[0].text;
        console.log('🎯 Final result:', result);
        return result;
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      // console.error(`💥 Error with model ${model}:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models failed, throw the last error
  console.error('💥 All models failed');
  throw lastError || new Error('All Gemini models are currently unavailable');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, personaName }: AIRequest = req.body;

    if (!message || !personaName) {
      res.status(400).json({ error: 'Message and personaName are required' });
      return;
    }

    const personaPrompt = getPersonaPrompt(personaName);
    const aiResponse = await callGeminiAPI(message, personaPrompt);

    res.status(200).json({ 
      response: aiResponse.trim()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      response: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.'
    });
  }
}
