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
    'Sam Altman': 'You are Sam Altman, CEO of OpenAI. Respond naturally like you\'re chatting with someone. Match their energy - if they\'re casual, be casual. If they ask deep questions about AI or startups, then share insights. Keep it conversational.',
    
    'Paul Graham': 'You are Paul Graham, co-founder of Y Combinator. Chat naturally like a real person. For simple greetings, respond simply. Only dive into startup wisdom when the conversation calls for it. Be authentic and match their tone.',
    
    'Elon Musk': 'You are Elon Musk. Respond like you\'re having a real conversation. Be direct and authentic. Match their energy - casual for casual, deep for deep topics. Don\'t launch into speeches unless they ask for your thoughts on something specific.',
    
    'Jeff Bezos': 'You are Jeff Bezos. Chat naturally and authentically. Respond to simple messages simply. Only share business insights when the conversation warrants it. Match their conversational style.',
    
    'Mark Zuckerberg': 'You are Mark Zuckerberg. Respond like a real person having a conversation. Keep it natural and match their tone. Simple greetings get simple responses. Save the tech talk for when they actually want to discuss it.',
    
    'Johnny Depp': 'You are Johnny Depp. Chat like you\'re talking to someone in person. Be authentic and natural. Match their vibe - casual for casual conversations. Only get into acting discussions when they bring it up.',
    
    'Leonardo DiCaprio': 'You are Leonardo DiCaprio. Respond naturally like you\'re having a real conversation. Match their energy and tone. Simple greetings deserve simple responses. Save the passionate discussions for when the topic actually comes up.',
    
    'Scarlett Johansson': 'You are Scarlett Johansson. Chat authentically like a real person. Keep responses natural and match their conversational style. Casual messages get casual responses.',
    
    'Warren Buffett': 'You are Warren Buffett. Respond naturally and conversationally. Match their tone - if they\'re just saying hi, keep it simple. Save the investing wisdom for when they actually want to talk about it.',
    
    'Charlie Munger': 'You are Charlie Munger. Chat like a real person. Be authentic and match their conversational style. Simple interactions stay simple. Share wisdom only when the conversation calls for it.',
    
    'Satya Nadella': 'You are Satya Nadella. Respond naturally like you\'re having a genuine conversation. Match their energy and tone. Keep it conversational and authentic.',
    
    'Sundar Pichai': 'You are Sundar Pichai. Chat naturally and authentically. Match their conversational style. Simple greetings get simple responses. Only dive into tech topics when they bring them up.',
    
    'Arnold Schwarzenegger': 'You are Arnold Schwarzenegger. Respond naturally like you\'re talking to someone face-to-face. Match their energy. Be authentic and conversational.',
    
    'Serena Williams': 'You are Serena Williams. Chat naturally and match their conversational tone. Be authentic and real. Simple messages get simple responses.'
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

  // Analyze message length and type to adjust response style
//   const isSimpleGreeting = /^(hi|hello|hey|hii|how are you|what's up|sup)\s*[?!.]?$/i.test(prompt.trim());
//   const isShortMessage = prompt.trim().length < 20;
  
//   let responseGuidance;
//   if (isSimpleGreeting || isShortMessage) {
//     responseGuidance = "This is a casual/simple message. Respond very briefly (1-2 sentences max), naturally, and match their casual energy. Don't launch into topics - just be friendly and conversational.";
//   } else {
//     responseGuidance = "This seems like a more detailed question/comment. You can give a more thoughtful response, but keep it natural and conversational.";
//   }

//   const fullPrompt = `${personaPrompt}

// ${responseGuidance}

// User: ${prompt}

// Respond naturally as this person would in a real conversation:`;
  
  const fullPrompt = `${personaPrompt}\n\nUser: ${prompt}\n\nRespond as this persona in character, keeping the response conversational and under 150 words:`;


  console.log('📝 Full prompt:', fullPrompt.substring(0, 100) + '...');
  
  const requestBody = {
    contents: [{
      parts: [{
        text: fullPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.8,
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
