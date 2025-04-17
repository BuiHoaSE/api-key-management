import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ApiException, createApiResponse } from '@/utils/api-response';

function cleanMarkdownContent(content) {
  return content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove image markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove multiple newlines
    .replace(/\n+/g, '\n')
    .trim();
}

async function fetchReadmeContent(repositoryUrl) {
  // Convert github.com URL to raw content URL
  const [owner, repo] = repositoryUrl.replace('https://github.com/', '').split('/');
  const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
  
  try {
    const response = await fetch(readmeUrl);
    if (!response.ok) {
      // Try master branch if main branch doesn't exist
      const masterReadmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const masterResponse = await fetch(masterReadmeUrl);
      if (!masterResponse.ok) {
        throw new Error('README not found in main or master branch');
      }
      return await masterResponse.text();
    }
    return await response.text();
  } catch (error) {
    throw new Error('Failed to fetch README content');
  }
}

async function generateSummary(readmeContent) {
  try {
    // Clean the content first
    const cleanContent = cleanMarkdownContent(readmeContent);
    
    // Split into sections and remove empty lines
    const sections = cleanContent.split('\n\n').filter(Boolean);
    
    // Find first meaningful paragraph (not a heading, longer than 50 chars)
    const mainSummary = sections.find(p => 
      !p.startsWith('#') && 
      p.length > 50 && 
      !p.includes('|') && // Skip tables
      !p.includes('```')  // Skip code blocks
    ) || sections[0];

    // Extract features (bullet points)
    const features = cleanContent
      .split('\n')
      .filter(line => (line.trim().startsWith('- ') || line.trim().startsWith('* ')) && line.length > 5)
      .map(line => line.replace(/^[- *] /, '').trim())
      .filter(line => !line.includes('```') && !line.includes('|')) // Remove code blocks and tables
      .slice(0, 4);

    // Extract cool facts from the summary
    const sentences = mainSummary.split(/[.!?]+/).filter(Boolean);
    const coolFacts = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => 
        sentence.length > 20 && 
        (
          sentence.includes('supports') ||
          sentence.includes('features') ||
          sentence.includes('provides') ||
          sentence.includes('enables') ||
          sentence.includes('allows') ||
          sentence.includes('built') ||
          sentence.includes('designed') ||
          sentence.includes('powered')
        )
      )
      .slice(0, 3);

    // Find additional facts from feature sections
    const featureSection = cleanContent
      .split(/^# |^## /m)
      .find(section => 
        section.toLowerCase().startsWith('features') || 
        section.toLowerCase().startsWith('highlights') ||
        section.toLowerCase().startsWith('benefits')
      );

    const additionalFacts = featureSection
      ? featureSection
          .split('\n')
          .filter(line => 
            line.length > 20 && 
            !line.startsWith('#') && 
            !line.includes('|') &&
            !line.includes('```')
          )
          .slice(1, 3)
          .map(line => line.trim())
          .filter(Boolean)
      : [];

    // Combine and deduplicate facts
    const allFacts = [...coolFacts, ...additionalFacts];
    const uniqueFacts = [...new Set(allFacts)];

    return {
      summary: mainSummary.trim(),
      key_features: features.filter(f => f.length > 0),
      cool_facts: uniqueFacts.slice(0, 4) // Limit to 4 unique facts
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    throw new Error('Failed to generate summary from README');
  }
}

async function validateApiKey(apiKey) {
  if (!apiKey) {
    throw new ApiException('UNAUTHORIZED', 'API key is required', 401);
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  // Step 1: Get key data
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, type, usage, rate_limit, expires_at')
    .eq('key', apiKey)
    .single();

  if (keyError) {
    console.error('[Debug] Error validating API key:', keyError);
    throw new ApiException('DATABASE_ERROR', 'Failed to validate API key', 500);
  }

  if (!keyData) {
    throw new ApiException('UNAUTHORIZED', 'Invalid API key', 401);
  }

  // Check if key is expired
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    throw new ApiException('UNAUTHORIZED', 'API key has expired', 401);
  }
  
  // Check rate limit
  if (keyData.usage >= keyData.rate_limit) {
    throw new ApiException('RATE_LIMIT_EXCEEDED', 'API key rate limit exceeded', 429);
  }
  
  // Step 2: Increment usage
  const { error: updateError } = await supabase
    .from('api_keys')
    .update({ 
      usage: keyData.usage + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', keyData.id);
    
  if (updateError) {
    console.error('[Debug] Error incrementing API key usage:', updateError);
    throw new ApiException('DATABASE_ERROR', 'Failed to update API key usage', 500);
  }

  return {
    ...keyData,
    usage: keyData.usage + 1  // Return the updated usage count
  };
}

async function fetchRepositoryDetails(repositoryUrl) {
  // Extract owner and repo from URL
  const [owner, repo] = repositoryUrl.replace('https://github.com/', '').split('/');
  
  try {
    // Fetch both repo details and latest release in parallel
    const [repoResponse, releaseResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Summarizer'
        }
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Summarizer'
        }
      })
    ]);

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository details');
    }

    const repoData = await repoResponse.json();
    let version = null;

    // Try to get version from latest release
    if (releaseResponse.ok) {
      const releaseData = await releaseResponse.json();
      version = releaseData.tag_name;
    }

    // If no releases found, try to get tags
    if (!version) {
      const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Summarizer'
        }
      });

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        version = tagsData[0]?.name || repoData.default_branch;
      } else {
        version = repoData.default_branch;
      }
    }
    
    return {
      stars: repoData.stargazers_count,
      latest_version: version,
      website: repoData.homepage,
      license: repoData.license?.name || 'No license'
    };
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return {
      stars: null,
      latest_version: null,
      website: null,
      license: null
    };
  }
}

export async function POST(request) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    // Validate API key
    await validateApiKey(apiKey);

    const { repositoryUrl } = await request.json();

    // Validate the URL
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+$/;
    
    if (!repositoryUrl || !githubUrlPattern.test(repositoryUrl)) {
      return NextResponse.json(
        createApiResponse(null, {
          code: 'VALIDATION_ERROR',
          message: 'Invalid GitHub URL. Please provide a valid GitHub repository URL (e.g., https://github.com/username/repository)'
        }),
        { status: 400 }
      );
    }

    // Fetch repository details and README content in parallel
    const [repoDetails, readmeContent] = await Promise.all([
      fetchRepositoryDetails(repositoryUrl),
      fetchReadmeContent(repositoryUrl)
    ]);

    const summary = await generateSummary(readmeContent);

    // Combine all details at the same level
    const response = {
      summary: summary.summary,
      key_features: summary.key_features,
      cool_facts: summary.cool_facts,
      stars: repoDetails.stars,
      latest_version: repoDetails.latest_version,
      website: repoDetails.website,
      license: repoDetails.license
    };

    return NextResponse.json(createApiResponse(response));
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      createApiResponse(null, {
        code: error instanceof ApiException ? error.code : 'INTERNAL_ERROR',
        message: error.message || 'Internal Server Error'
      }),
      { status: error instanceof ApiException ? error.status : 500 }
    );
  }
}


