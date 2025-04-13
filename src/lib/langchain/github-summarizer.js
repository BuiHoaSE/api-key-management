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
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Function to generate a summary from README content
function generateSummary(content) {
  // Remove HTML comments and special sections
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Split into paragraphs
  const paragraphs = content.split('\n\n');
  let summary = '';

  // Find the first meaningful paragraph
  for (const para of paragraphs) {
    const cleanPara = cleanText(para);
    if (cleanPara && 
        !cleanPara.startsWith('#') && 
        !cleanPara.startsWith('---') && 
        cleanPara.length > 50) {
      summary = cleanPara;
      break;
    }
  }

  return summary || "No summary available.";
}

// Function to extract cool facts from README
function extractCoolFacts(content) {
  // Remove HTML comments and special sections
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  const coolFacts = [];

  // Extract bullet points
  const bulletMatches = content.match(/[-*]\s+([^\n]+)/g) || [];
  for (const bullet of bulletMatches) {
    const cleanBullet = cleanText(bullet);
    if (cleanBullet.length > 30 && cleanBullet.length < 200) {
      coolFacts.push(cleanBullet);
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
            /feature|support|provide|enable|allow|include|offer/i.test(cleanSentence)) {
          coolFacts.push(cleanSentence + '.');
        }
      }
    }
  }

  // Return unique facts
  return [...new Set(coolFacts)].slice(0, 3);
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