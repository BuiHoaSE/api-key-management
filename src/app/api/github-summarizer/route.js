import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { processGitHubRepository } from '@/lib/langchain/github-summarizer';

export async function POST(request) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('x-api-key');
    
    // Parse the request body
    const body = await request.json();
    const { repositoryUrl } = body;

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate repository URL
    if (!repositoryUrl) {
      return NextResponse.json(
        { success: false, message: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with await
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Validate API key
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('id')
        .eq('key', apiKey)
        .maybeSingle();

      if (apiKeyError) {
        console.error('Database query error:', apiKeyError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error validating API key',
            error: apiKeyError.message 
          },
          { status: 500 }
        );
      }

      if (!apiKeyData) {
        return NextResponse.json(
          { success: false, message: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Process the GitHub repository
      const result = await processGitHubRepository(repositoryUrl);
      
      if (!result.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error processing repository',
            error: result.error 
          },
          { status: 500 }
        );
      }

      // Return the successful response with the summary
      return NextResponse.json({
        success: true,
        message: 'Repository successfully analyzed',
        data: result.data
      });

    } catch (dbError) {
      console.error('Supabase initialization error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection error',
          error: dbError.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing request',
        error: error.message 
      },
      { status: 500 }
    );
  }
}


