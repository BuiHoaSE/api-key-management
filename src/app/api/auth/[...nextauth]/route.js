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
            .select('id, email')
            .eq('email', user.email)
            .single();

          if (queryError && queryError.code !== 'PGRST116') {
            console.error('Error checking for existing user:', queryError);
            return false;
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
              .select('id, email')
              .single();

            if (error) {
              console.error('Error creating new user:', error);
              return false;
            }
            console.log('Successfully created new user:', data);
            // Store Supabase user ID in the user object
            user.supabaseId = data.id;
          } else {
            // Store existing Supabase user ID in the user object
            user.supabaseId = existingUser.id;
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // If signing in, add the Supabase user ID to the token
      if (account && user) {
        token.supabaseId = user.supabaseId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.supabaseId) {
        session.user.id = token.supabaseId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + "/dashboard";
    },
  },
});

export { handler as GET, handler as POST }; 