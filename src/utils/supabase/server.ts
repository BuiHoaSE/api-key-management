import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { ApiException } from '../api-response'

export function createServerSupabaseClient() {
  return createRouteHandlerClient<Database>({ cookies })
}

/**
 * Gets the Supabase user ID from an email address
 * @param email The email address to look up
 * @returns The Supabase user ID
 * @throws {ApiException} If the email is invalid or user not found
 */
export async function getSupabaseUserIdFromEmail(email: string): Promise<string> {
  if (!email) {
    throw new ApiException('INVALID_INPUT', 'Email is required', 400)
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (error) {
    throw new ApiException('DATABASE_ERROR', 'Error fetching user', 500, error.message)
  }

  if (!data) {
    throw new ApiException(
      'USER_NOT_FOUND',
      `User with email ${email} not found`,
      404
    )
  }

  return data.id
} 