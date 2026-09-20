import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name कम से कम 2 characters का होना चाहिए').max(50),
  email: z.string().email('सही email address डालो'),
  password: z.string().min(6, 'Password कम से कम 6 characters का होना चाहिए'),
});

export async function POST(req: Request) {
  try {
    console.log('📝 Register request received');
    
    const body = await req.json();
    console.log('📦 Body:', { ...body, password: '***' });
    
    // Validate data
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => e.message);
      console.log('❌ Validation failed:', errors);
      return NextResponse.json(
        { success: false, message: errors[0] },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { success: false, message: 'इस email से account पहले से है' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 Password hashed');
    
    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      plan: 'free',
      watchlist: ['EURUSD', 'GBPUSD', 'XAUUSD'],
    });
    
    console.log('✅ User created:', user.email);
    
    return NextResponse.json(
      {
        success: true,
        message: '🎉 Account successfully बन गया!',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Register error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'कुछ गलत हो गया',
      },
      { status: 500 }
    );
  }
}