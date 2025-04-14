import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          console.log('Attempting to sign in user:', user.email);
          
          // Check if user exists
          const { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select()
            .eq('email', user.email)
            .single();

          if (queryError) {
            console.error('Error checking for existing user:', queryError);
          }

          if (!existingUser) {
            console.log('Creating new user record');
            const newUser = {
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              provider: 'google',
              provider_id: user.id,
              created_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();

            if (error) {
              console.error('Error creating new user:', error);
              throw error;
            }
            console.log('Successfully created new user:', data);
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return true;
        }
      }
      return true;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to the callback URL if it's provided and is a relative URL or matches the base URL
      if (url.startsWith('/') || url.startsWith(baseUrl)) {
        return url;
      }
      // Default to dashboard
      return '/dashboard';
    },
  },
});

export { handler as GET, handler as POST }; 