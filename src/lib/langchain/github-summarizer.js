// Function to fetch README content from GitHub
async function getReadmeContent(repositoryUrl) {
  try {
    // Extract owner and repo from URL
    const urlParts = repositoryUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    // Construct raw README URL
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    
    // Fetch README content
    const response = await fetch(readmeUrl);
    
    if (!response.ok) {
      // Try fallback to master branch if main doesn't exist
      const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        throw new Error('README not found in main or master branch');
      }
      
      const content = await fallbackResponse.text();
      return content;
    }

    const content = await response.text();
    return content;

  } catch (error) {
    console.error('Error fetching README:', error);
    throw error;
  }
}

// Function to clean text from markdown and HTML
function cleanText(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links but keep text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/`([^`]+)`/g, '$1') // Remove code backticks but keep content
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Function to extract the project title
function extractTitle(content) {
  // Try to find the first header
  const headerMatch = content.match(/^#\s+(.+)$/m);
  if (headerMatch) {
    return cleanText(headerMatch[1]);
  }

  // If no header, try to find the first non-empty line
  const lines = content.split('\n');
  for (const line of lines) {
    const cleaned = cleanText(line);
    if (cleaned && !cleaned.startsWith('---')) {
      return cleaned;
    }
  }

  return "Untitled Project";
}

// Function to generate summary from README content
function generateSummary(content) {
  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, '');
  
  // Split into paragraphs
  const paragraphs = content.split('\n\n');
  
  // Find the first meaningful paragraph after the title
  let summary = '';
  let foundTitle = false;
  
  for (const para of paragraphs) {
    const cleanPara = cleanText(para);
    
    // Skip empty paragraphs and common sections to avoid
    if (!cleanPara || 
        cleanPara.toLowerCase().includes('table of contents') ||
        cleanPara.toLowerCase().includes('installation') ||
        /^[=-]+$/.test(cleanPara)) {
      continue;
    }

    // If this is the title paragraph, mark it and continue
    if (!foundTitle && cleanPara === extractTitle(content)) {
      foundTitle = true;
      continue;
    }

    // If we've found a substantial paragraph after the title
    if (foundTitle && cleanPara.length > 50) {
      summary = cleanPara;
      break;
    }

    // If we haven't found the title yet but found a good paragraph
    if (!foundTitle && cleanPara.length > 50) {
      summary = cleanPara;
      break;
    }
  }

  // If no good paragraph found, try to combine meaningful sentences
  if (!summary) {
    const sentences = content.split(/[.!?]+/)
      .map(s => cleanText(s))
      .filter(s => s.length > 30 && !s.toLowerCase().includes('installation'));
    
    summary = sentences.slice(0, 2).join('. ') + '.';
  }

  return summary;
}

// Function to extract cool facts from README
function extractCoolFacts(content) {
  // Remove HTML comments and special sections
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
  
  const coolFacts = new Set();

  // Extract bullet points that look like features
  const bulletMatches = content.match(/[-*]\s+([^\n]+)/g) || [];
  for (const bullet of bulletMatches) {
    const cleanBullet = cleanText(bullet);
    if (cleanBullet.length > 30 && 
        cleanBullet.length < 200 && 
        /feature|support|provide|enable|allow|include|offer|built|create|manage|integrate|customize|automate/i.test(cleanBullet)) {
      coolFacts.add(cleanBullet);
    }
  }

  // Extract feature descriptions from paragraphs
  const paragraphs = content.split('\n\n');
  for (const para of paragraphs) {
    if (!para.startsWith('#') && !para.startsWith('---')) {
      const cleanPara = cleanText(para);
      const sentences = cleanPara.split(/[.!?]+/);
      
      for (const sentence of sentences) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 30 && 
            cleanSentence.length < 200 && 
            /feature|support|provide|enable|allow|include|offer|built|create|manage|integrate|customize|automate/i.test(cleanSentence)) {
          coolFacts.add(cleanSentence + '.');
        }
      }
    }
  }

  // Convert Set to Array and get the most interesting facts
  return Array.from(coolFacts)
    .sort((a, b) => {
      // Prioritize sentences with more feature-related keywords
      const aKeywords = a.match(/feature|support|provide|enable|allow|include|offer|built|create|manage|integrate|customize|automate/gi) || [];
      const bKeywords = b.match(/feature|support|provide|enable|allow|include|offer|built|create|manage|integrate|customize|automate/gi) || [];
      return bKeywords.length - aKeywords.length;
    })
    .slice(0, 3);
}

// Main function to process GitHub repository
export async function processGitHubRepository(repositoryUrl) {
  try {
    // Step 1: Fetch README content
    const readmeContent = await getReadmeContent(repositoryUrl);
    
    // Step 2: Analyze the content
    const analysis = {
      summary: generateSummary(readmeContent),
      cool_facts: extractCoolFacts(readmeContent)
    };
    
    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error processing GitHub repository:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
