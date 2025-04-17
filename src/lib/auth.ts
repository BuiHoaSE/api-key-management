import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { getServerSession } from 'next-auth'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials');
}

// Initialize Supabase admin client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      
      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', user.email)
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          console.error('Error checking user:', queryError);
          return false;
        }

        if (!existingUser) {
          // Create new user in Supabase
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              provider: 'google',
              provider_id: account?.providerAccountId,
            }])
            .select('id, email')
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            return false;
          }

          // Set the Supabase UUID as the NextAuth user ID
          user.id = newUser.id;
        } else {
          // Use the existing Supabase UUID as the NextAuth user ID
          user.id = existingUser.id;
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        // Use the Supabase UUID stored in the token
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Store the Supabase UUID in the token
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};

export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

export async function getUserId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    throw new Error('Failed to get user session')
  }

  if (!session?.user?.id) {
    throw new Error('No authenticated user found')
  }

  return session.user.id
}

export async function getUser() {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    throw new Error('Failed to get user session')
  }

  if (!session?.user) {
    return null
  }

  return session.user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function authenticateUserByDomain(email: string, allowedDomain: string) {
  if (!email.endsWith(`@${allowedDomain}`)) {
    throw new Error(`Only users with @${allowedDomain} email addresses are allowed`)
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error querying user:', error)
      throw new Error('Failed to authenticate user')
    }

    if (!user) {
      throw new Error('User not found')
    }

    return user.id
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('No authenticated session')
  }

  // Check if the requesting user is trying to access their own data
  if (session.user.email !== email) {
    throw new Error('Unauthorized to access this user data')
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user data')
    }

    if (!user) {
      throw new Error('User not found')
    }

    return {
      ...user,
      sessionId: session.user.id // Include the NextAuth session ID
    }
  } catch (error) {
    console.error('Error in getUserByEmail:', error)
    throw error
  }
} 