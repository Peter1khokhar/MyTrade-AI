import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    // ═══════════════════════════════════════════════════════════
    // 🔵 Google OAuth Provider
    // ═══════════════════════════════════════════════════════════
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // ═══════════════════════════════════════════════════════════
    // 🔐 Credentials Provider (Email + Password)
    // ═══════════════════════════════════════════════════════════
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email और Password दोनों ज़रूरी हैं');
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        }).select('+password');

        if (!user) {
          throw new Error('इस email से कोई account नहीं मिला');
        }

        // User created via Google - no password
        if (!user.password) {
          throw new Error('इस account से Google से login करो');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Password गलत है');
        }

        // Email verification check
        if (!user.isEmailVerified) {
          throw new Error('पहले अपना email verify करो');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // ═══════════════════════════════════════════════════════════
    // 🔵 signIn callback - Google user create/update
    // ═══════════════════════════════════════════════════════════
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();

          const existingUser = await User.findOne({
            email: user.email?.toLowerCase(),
          });

          if (existingUser) {
            // Existing user - update Google info
            existingUser.image = user.image || existingUser.image;
            existingUser.isEmailVerified = true; // Google verified
            if (!existingUser.provider || existingUser.provider === 'credentials') {
              existingUser.provider = existingUser.password ? 'credentials' : 'google';
            }
            await existingUser.save();
            user.id = existingUser._id.toString();
            console.log('✅ Google sign-in: existing user', user.email);
          } else {
            // New user via Google
            const newUser = await User.create({
              name: user.name || 'Google User',
              email: user.email?.toLowerCase(),
              image: user.image,
              provider: 'google',
              isEmailVerified: true, // Google already verified
              plan: 'free',
              watchlist: ['EURUSD', 'GBPUSD', 'XAUTUSD'],
            });
            user.id = newUser._id.toString();
            console.log('✅ New user via Google:', user.email);
          }

          return true;
        } catch (error) {
          console.error('❌ Google sign-in error:', error);
          return false;
        }
      }

      return true;
    },

    // ═══════════════════════════════════════════════════════════
    // 🎫 JWT callback
    // ═══════════════════════════════════════════════════════════
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      return token;
    },

    // ═══════════════════════════════════════════════════════════
    // 📦 Session callback
    // ═══════════════════════════════════════════════════════════
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});