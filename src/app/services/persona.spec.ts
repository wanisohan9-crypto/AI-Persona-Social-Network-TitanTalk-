import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PersonaService, Persona } from './persona';

describe('PersonaService', () => {
  let service: PersonaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonaService);
  });

  describe('initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should have 14 personas loaded', () => {
      const personas = service.getAllPersonas();
      expect(personas.length).toBe(14);
    });
  });

  describe('getAllPersonas', () => {
    it('should return all personas', () => {
      const personas = service.getAllPersonas();
      expect(personas.length).toBe(14);
      expect(personas[0].id).toBeDefined();
      expect(personas[0].name).toBeDefined();
      expect(personas[0].category).toBeDefined();
    });

    it('should return personas with required properties', () => {
      const personas = service.getAllPersonas();
      personas.forEach(persona => {
        expect(persona.id).toBeDefined();
        expect(persona.name).toBeDefined();
        expect(persona.avatar).toBeDefined();
        expect(persona.category).toBeDefined();
        expect(persona.description).toBeDefined();
        expect(persona.greeting).toBeDefined();
      });
    });
  });

  describe('getPersonasByCategory', () => {
    it('should return startup founder personas', () => {
      const startupPersonas = service.getPersonasByCategory('Startup Founder');
      expect(startupPersonas.length).toBe(5);
      expect(startupPersonas.every(p => p.category === 'Startup Founder')).toBe(true);
    });

    it('should return acting personas', () => {
      const actingPersonas = service.getPersonasByCategory('Acting');
      expect(actingPersonas.length).toBe(3);
      expect(actingPersonas.every(p => p.category === 'Acting')).toBe(true);
    });

    it('should return finance personas', () => {
      const financePersonas = service.getPersonasByCategory('Finance');
      expect(financePersonas.length).toBe(2);
      expect(financePersonas.every(p => p.category === 'Finance')).toBe(true);
    });

    it('should return technology personas', () => {
      const techPersonas = service.getPersonasByCategory('Technology');
      expect(techPersonas.length).toBe(2);
      expect(techPersonas.every(p => p.category === 'Technology')).toBe(true);
    });

    it('should return fitness personas', () => {
      const fitnessPersonas = service.getPersonasByCategory('Fitness');
      expect(fitnessPersonas.length).toBe(2);
      expect(fitnessPersonas.every(p => p.category === 'Fitness')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const unknownPersonas = service.getPersonasByCategory('Unknown Category');
      expect(unknownPersonas.length).toBe(0);
    });

    it('should be case-sensitive for categories', () => {
      const lowerCasePersonas = service.getPersonasByCategory('startup founder');
      expect(lowerCasePersonas.length).toBe(0);
    });
  });

  describe('getPersonaById', () => {
    it('should return Sam Altman for id 1', () => {
      const persona = service.getPersonaById(1);
      expect(persona?.name).toBe('Sam Altman');
      expect(persona?.category).toBe('Startup Founder');
    });

    it('should return Warren Buffett for id 9', () => {
      const persona = service.getPersonaById(9);
      expect(persona?.name).toBe('Warren Buffett');
      expect(persona?.category).toBe('Finance');
    });

    it('should return undefined for non-existent id', () => {
      const persona = service.getPersonaById(999);
      expect(persona).toBeUndefined();
    });

    it('should return undefined for negative id', () => {
      const persona = service.getPersonaById(-1);
      expect(persona).toBeUndefined();
    });
  });

  describe('specific personas validation', () => {
    it('should have correct startup founders', () => {
      const startupPersonas = service.getPersonasByCategory('Startup Founder');
      const names = startupPersonas.map(p => p.name);
      expect(names).toContain('Sam Altman');
      expect(names).toContain('Paul Graham');
      expect(names).toContain('Elon Musk');
      expect(names).toContain('Jeff Bezos');
      expect(names).toContain('Mark Zuckerberg');
    });

    it('should have unique IDs for all personas', () => {
      const personas = service.getAllPersonas();
      const ids = personas.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have non-empty greetings for all personas', () => {
      const personas = service.getAllPersonas();
      personas.forEach(persona => {
        expect(persona.greeting.length).toBeGreaterThan(10);
        expect(persona.greeting).not.toBe('');
      });
    });
  });
});
