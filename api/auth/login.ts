import { VercelRequest, VercelResponse } from '@vercel/node';
import { sign } from 'jsonwebtoken';

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
    role: 'user' | 'admin';  // Add this line
  createdAt: string;
}

// Demo users for testing
const users: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'john@test.com',
    name: 'John Smith',
    password: 'test123',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'jane@test.com',
    name: 'Jane Doe',
    password: 'demo123',
    role: 'user',
    createdAt: new Date().toISOString()
  },
    // Admin users
  {
    id: '4',
    email: 'admin@titantalk.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    email: 'super@admin.com',
    name: 'Super Admin',
    password: 'super123',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

function validatePassword(inputPassword: string, storedPassword: string): boolean {
  return inputPassword === storedPassword;
}

function generateToken(user: User): string {
  return sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');


  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
      return;
    }

    const user = findUserByEmail(email);

    if (!user || !validatePassword(password, user.password)) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
