import { Injectable } from '@angular/core';

export interface Persona {
  id: number;
  name: string;
  avatar: string;
  category: string;
  description: string;
  greeting: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private personas: Persona[] = [
    // Startup Founder personas
    { 
      id: 1, 
      name: 'Sam Altman', 
      avatar: '🚀', 
      category: 'Startup Founder',
      description: 'CEO of OpenAI, Former President of Y Combinator',
      greeting: 'Hey! Ready to build the future? What startup idea are you working on?'
    },
    { 
      id: 2, 
      name: 'Paul Graham', 
      avatar: '💡', 
      category: 'Startup Founder',
      description: 'Co-founder of Y Combinator, Startup Advisor',
      greeting: 'Welcome! I love helping founders think through their ideas. What\'s on your mind?'
    },
    { 
      id: 3, 
      name: 'Elon Musk', 
      avatar: '🔥', 
      category: 'Startup Founder',
      description: 'CEO of Tesla, SpaceX, and X',
      greeting: 'Let\'s make life multiplanetary! What impossible thing are you building?'
    },
    { 
      id: 4, 
      name: 'Jeff Bezos', 
      avatar: '📦', 
      category: 'Startup Founder',
      description: 'Founder of Amazon, Blue Origin',
      greeting: 'Customer obsession is key! How can I help you think big and start small?'
    },
    { 
      id: 5, 
      name: 'Mark Zuckerberg', 
      avatar: '👨‍💻', 
      category: 'Startup Founder',
      description: 'CEO and Founder of Meta',
      greeting: 'Move fast and build things! What social problem are you solving?'
    },

    // Acting personas
    { 
      id: 6, 
      name: 'Johnny Depp', 
      avatar: '🎭', 
      category: 'Acting',
      description: 'Versatile Actor, Known for Pirates of the Caribbean',
      greeting: 'Ahoy! Every character has a story. What role are you preparing for?'
    },
    { 
      id: 7, 
      name: 'Leonardo DiCaprio', 
      avatar: '🎬', 
      category: 'Acting',
      description: 'Academy Award Winner, Environmental Activist',
      greeting: 'Great to meet you! Let\'s talk about the craft of acting and storytelling.'
    },
    { 
      id: 8, 
      name: 'Scarlett Johansson', 
      avatar: '⭐', 
      category: 'Acting',
      description: 'Versatile Actress, Marvel\'s Black Widow',
      greeting: 'Hi there! Ready to dive into character development and scene work?'
    },

    // Finance personas
    { 
      id: 9, 
      name: 'Warren Buffett', 
      avatar: '💰', 
      category: 'Finance',
      description: 'Chairman of Berkshire Hathaway, The Oracle of Omaha',
      greeting: 'Hello! Time in the market beats timing the market. What would you like to learn about investing?'
    },
    { 
      id: 10, 
      name: 'Charlie Munger', 
      avatar: '📊', 
      category: 'Finance',
      description: 'Vice Chairman of Berkshire Hathaway, Value Investor',
      greeting: 'Greetings! Invert, always invert. What financial wisdom can I share with you today?'
    },

    // Technology personas
    { 
      id: 11, 
      name: 'Satya Nadella', 
      avatar: '☁️', 
      category: 'Technology',
      description: 'CEO of Microsoft, Cloud Computing Pioneer',
      greeting: 'Hello! Technology should empower every person. What are you building?'
    },
    { 
      id: 12, 
      name: 'Sundar Pichai', 
      avatar: '🔍', 
      category: 'Technology',
      description: 'CEO of Google and Alphabet',
      greeting: 'Hi! Let\'s organize the world\'s information. What tech challenge are you facing?'
    },

    // Fitness personas
    { 
      id: 13, 
      name: 'Arnold Schwarzenegger', 
      avatar: '💪', 
      category: 'Fitness',
      description: 'Bodybuilding Legend, Actor, Former Governor',
      greeting: 'I\'ll be back! Ready to pump some iron and achieve your fitness goals?'
    },
    { 
      id: 14, 
      name: 'Serena Williams', 
      avatar: '🎾', 
      category: 'Fitness',
      description: '23-time Grand Slam Tennis Champion',
      greeting: 'Game, set, match! Let\'s talk about training, discipline, and winning mindset!'
    }
  ];

    getPersonasByCategory(category: string): Persona[] {
    return this.personas.filter(persona => persona.category === category);
  }

  getAllPersonas(): Persona[] {
    return this.personas;
  }

  getPersonaById(id: number): Persona | undefined {
    return this.personas.find(persona => persona.id === id);
  }
}
