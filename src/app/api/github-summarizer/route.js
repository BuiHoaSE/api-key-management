import { NextResponse } from 'next/server';

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

export async function POST(request) {
  try {
    const { repositoryUrl } = await request.json();

    // Validate the URL
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_]+$/;
    
    if (!repositoryUrl || !githubUrlPattern.test(repositoryUrl)) {
      return NextResponse.json(
        {
          error: "Invalid GitHub URL. Please provide a valid GitHub repository URL (e.g., https://github.com/username/repository)"
        },
        { status: 400 }
      );
    }

    // Fetch and process README content
    const readmeContent = await fetchReadmeContent(repositoryUrl);
    const summary = await generateSummary(readmeContent);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}


