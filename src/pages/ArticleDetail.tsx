import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article, getArticleBySlug, getRecentArticles } from '../data/mockArticles';
import { ArrowLeft, Clock, BookOpen, ChevronLeft, Share2, Bookmark } from 'lucide-react';
import { marked } from 'marked';

/**
 * Advanced content processor for optimal article display
 * Ensures professionally formatted content with proper spacing,
 * list formatting, and typographic improvements
 * 
 * The function performs the following improvements:
 * 1. Normalizes line breaks for consistent rendering
 * 2. Ensures proper spacing between paragraphs
 * 3. Detects and formats implicit lists
 * 4. Corrects spacing around headings
 * 5. Improves formatting of numbered and bulleted lists
 */
function processContent(content: string): string {
  if (!content) return '';
  
  // Special case pre-processing for specific articles with known formatting issues
  
  // Find and format nutrient sections in the plant nutrition article
  if (content.includes('### Secondary Macronutrients') || content.includes('## The Essential Nutrients')) {
    // Add markdown-style bullets to each nutrient property description
    
    // For Calcium (Ca)
    content = content.replace(
      /\*\*Calcium \(Ca\)\*\*\n(Essential for cell wall strength)\n\n(Helps plants absorb other nutrients)\n\n(Deficiency appears in new growth as distorted leaves)/g,
      '**Calcium (Ca)**\n* $1\n* $2\n* $3'
    );
    
    // For Magnesium (Mg)
    content = content.replace(
      /\*\*Magnesium \(Mg\)\*\*\n(Central atom in chlorophyll molecules)\n\n(Essential for photosynthesis)\n\n(Deficiency shows as interveinal yellowing \(yellow leaves with green veins\))/g,
      '**Magnesium (Mg)**\n* $1\n* $2\n* $3'
    );
    
    // For Sulfur (S)
    content = content.replace(
      /\*\*Sulfur \(S\)\*\*\n(Component of amino acids and proteins)\n\n(Contributes to chlorophyll production)\n\n(Deficiency appears as light green younger leaves)/g,
      '**Sulfur (S)**\n* $1\n* $2\n* $3'
    );
    
    // For Nitrogen (N)
    content = content.replace(
      /\*\*Nitrogen \(N\)\*\*\n(Promotes leafy, vegetative growth)\n\n(Key component of chlorophyll and amino acids)\n\n(Deficiency shows as yellowing of older leaves)\n\n(Excess causes leggy growth with weak stems)/g,
      '**Nitrogen (N)**\n* $1\n* $2\n* $3\n* $4'
    );
    
    // For Phosphorus (P)
    content = content.replace(
      /\*\*Phosphorus \(P\)\*\*\n(Essential for root development and flowering)\n\n(Important for energy transfer within the plant)\n\n(Deficiency shows as purple tinges on leaves and poor flowering)\n\n(Supports seed and fruit production)/g,
      '**Phosphorus (P)**\n* $1\n* $2\n* $3\n* $4'
    );
    
    // For Potassium (K)
    content = content.replace(
      /\*\*Potassium \(K\)\*\*\n(Regulates water uptake and transpiration)\n\n(Strengthens cell walls and improves disease resistance)\n\n(Enhances flower and fruit quality)\n\n(Deficiency appears as scorched leaf margins and weak stems)/g,
      '**Potassium (K)**\n* $1\n* $2\n* $3\n* $4'
    );
  }
  
  // Find and properly format "Types of Fertilizers" sections in plant articles
  if (content.includes('### Types of Fertilizers') || content.includes('## Types of Fertilizers')) {
    content = content.replace(
      /\*\*(Organic|Synthetic|Chemical|Slow-Release|Liquid) Fertilizers\*\*\n([^*\n]+)/g,
      '- **$1 Fertilizers** - $2'
    );
  }
  
  // Format "Signs of X" sections that are common in plant articles
  content = content.replace(
    /###\s+Signs\s+of\s+([A-Za-z\s]+)\n\n([^\n-][^\n]+)\n([^\n-][^\n]+)\n([^\n-][^\n]+)/g,
    '### Signs of $1\n\n- $2\n- $3\n- $4'
  );
  
  // Format "Care tips" sections to have proper bullet points
  content = content.replace(
    /\*\*Care tips:\*\*\n\n([^\n-][^\n]+)\n([^\n-][^\n]+)\n([^\n-][^\n]+)\n([^\n-][^\n]+)/g,
    '**Care tips:**\n\n- $1\n- $2\n- $3\n- $4'
  );
  
  // Normalize line breaks and clean up excessive spacing
  let processed = content
    // Convert Windows line endings to Unix style
    .replace(/\r\n/g, '\n')
    // Ensure each header has a blank line before it (except at the start)
    .replace(/([^\n])\n(#+\s)/g, '$1\n\n$2')
    // Ensure there's a blank line after each header
    .replace(/(#+\s+[^\n]+)\n(?![\n])/g, '$1\n\n')
    // Normalize all multiple line breaks to exactly two
    .replace(/\n{3,}/g, '\n\n')
    // Each paragraph should be separated by blank lines
    .replace(/(.+)\n(.+)/g, function(match, p1, p2) {
      // Don't add blank lines for list items or if already has blank line
      if (p2.startsWith('-') || p2.startsWith('#') || p2.startsWith('*')) {
        return match;
      }
      return p1 + '\n\n' + p2;
    })
    .trim();

  // ---- LIST FORMATTING ----
  
  // 1. Detect and fix bullet list patterns
  
  // Advanced bullet point detection for short, capitalized sentence sequences
  processed = processed.replace(
    /([.:])\s*\n\s*\n([A-Z][^#\n.]+[.!?])\s*\n\s*([A-Z][^#\n.]+[.!?])/g,
    (match, endChar, line1, line2) => {
      // Skip if lines are very long (likely paragraphs, not list items)
      if (line1.length > 120 || line2.length > 120) return match;
      return `${endChar}\n\n- ${line1.trim()}\n- ${line2.trim()}`;
    }
  );
  
  // Detect common bullet point patterns that aren't properly formatted
  processed = processed.replace(
    /\n([•\-–—*]|\\+|\>\s*|\\s{2,})\s*([A-Z][^\n]+)/g,
    '\n- $2'
  );
  
  // Convert any lines starting with a dash but missing proper spacing
  processed = processed.replace(
    /\n-([^\s])/g,
    '\n- $1'
  );
  
  // Convert short, sequential items starting with capitals (especially after a heading)
  processed = processed.replace(
    /\n(#+[^\n]+)\n\n([A-Z][^#\n.]+[.!?])\n([A-Z][^#\n.]+[.!?])\n(?![A-Z])/g,
    (match, heading, line1, line2) => {
      // Only convert if they look like list items (reasonably short)
      if (line1.length < 100 && line2.length < 100) {
        return `\n${heading}\n\n- ${line1}\n- ${line2}\n\n`;
      }
      return match;
    }
  );
  
  // Convert sequences of similar short phrases that look like they should be bullet points
  processed = processed.replace(
    /\n([A-Z][^.\n]{3,40}[.:])\n([A-Z][^.\n]{3,40}[.:])\n([A-Z][^.\n]{3,40}[.:])/g,
    '\n- $1\n- $2\n- $3'
  );
  
  // Ensure all bullet points use consistent format with proper spacing
  processed = processed.replace(/\n[-*+•](?!\s)/g, '\n- ');
  
  // 2. Lines after list indicator phrases - expanded to catch more list patterns
  const listIndicators = [
    'include', 'such as', 'examples', 'following', 'signs', 'symptoms',
    'benefits', 'advantages', 'features', 'reasons', 'steps', 'tips', 'ways',
    'factors', 'techniques', 'methods', 'strategies', 'options', 'varieties',
    'types', 'categories', 'solutions', 'problems', 'issues', 'causes',
    'effects', 'aspects', 'characteristics', 'considerations', 'requirements',
    'elements', 'components', 'principles', 'phases', 'stages', 'patterns'
  ];
  
  // Build a regex pattern from the list indicators
  const indicatorPattern = new RegExp(
    `(${listIndicators.join('|')})[\\s]*:?\\s*\\n\\s*\\n([A-Z][^-#\\n][^\\n]+)`,
    'gi'
  );
  
  processed = processed.replace(
    indicatorPattern,
    (match, prefix, firstItem) => `${prefix}:\n\n- ${firstItem.trim()}`
  );
  
  // Special case: Handle specific patterns for care tips sections
  processed = processed.replace(
    /\n\*\*(?:Care tips|Tips|Care instructions|Instructions|Requirements):\*\*\s*\n\s*\n([A-Z][^\n]+)\n\s*\n([A-Z][^\n]+)/g,
    '\n**$1:**\n\n- $2\n- $3'
  );
  
  // Handle all sections with "Signs" in the title
  processed = processed.replace(
    /\n### Signs of ([A-Za-z\s]+)\n\n([A-Z][^\n-]+)\n([A-Z][^\n-]+)/g,
    '\n### Signs of $1\n\n- $2\n- $3'
  );
  
  // Extra handling for "Signs include:" section that's common in plant articles
  processed = processed.replace(
    /\n([A-Za-z\s]+)\s+include:\s*\n\s*\n([A-Z][^\n]+)\n([A-Z][^\n]+)/g,
    '\n$1 include:\n\n- $2\n- $3'
  );
  
  // Special case for lines after "include:" with paragraphs containing short sentences
  processed = processed.replace(
    /include:\n\n([A-Z][^\n.]+\.[^\n.]+\.[^\n.]+\.)\n\n([A-Z][^\n.]+\.[^\n.]+\.)/g, 
    'include:\n\n- $1\n- $2'
  );
  
  // Format content after colons (likely lists)
  processed = processed.replace(
    /([Tt]ips|[Ss]igns|[Ss]ymptoms|[Pp]roperties|[Ss]olutions|[Mm]ethods|[Oo]ptions|[Ss]teps|[Bb]enefits|[Aa]dvantages):\n\n([A-Z][^\n-]+\.)\n([A-Z][^\n-]+\.)\n([A-Z][^\n-]+\.)/g,
    '$1:\n\n- $2\n- $3\n- $4'
  );
  
  // 3. Enhanced list detection for sequential short paragraphs
  const lines = processed.split('\n');
  let potentialListItems = [];
  let inListSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const prevLine = i > 0 ? lines[i-1].trim() : '';
    
    // Detect potential list section starts
    if (!inListSection && 
        ((prevLine.endsWith(':') || 
          listIndicators.some(indicator => 
            prevLine.toLowerCase().includes(indicator))) && 
        line === '')) {
      inListSection = true;
      continue;
    }
    
    // Collect and process potential list items
    if (inListSection) {
      // Potential list item criteria:
      // - Starts with capital letter
      // - Moderate length (not too short, not too long)
      // - Not already a list item
      // - Not a header
      if (line.match(/^[A-Z]/) && 
          line.length > 5 &&
          line.length < 150 && 
          !line.startsWith('-') && 
          !line.startsWith('*') &&
          !line.match(/^[0-9]/) &&
          !line.startsWith('#')) {
        potentialListItems.push(i);
      }
      
      // End list section detection
      if ((line === '' && potentialListItems.length > 0) || 
          line.startsWith('#') || 
          i === lines.length - 1) {
        
        // Confirm and convert list items if we have enough
        if (potentialListItems.length >= 2) {
          potentialListItems.forEach(idx => {
            lines[idx] = `- ${lines[idx]}`;
          });
        }
        
        // Reset for next potential list
        inListSection = false;
        potentialListItems = [];
      }
    }
  }
  
  // ---- TYPOGRAPHY IMPROVEMENTS ----
  
  // Rejoin lines with the modified list items
  processed = lines.join('\n');
  
  // Ensure proper spacing around headings
  processed = processed
    .replace(/(\n#+\s+[^\n]+)\n(?!\n)/g, '$1\n\n')
    .replace(/(\n\n#+\s+[^\n]+)\n\n\n+/g, '$1\n\n');
  
  // Ensure proper spacing around lists
  processed = processed
    .replace(/\n\n\n+(- |\* |\d+\. )/g, '\n\n$1')
    .replace(/\n(- |\* |\d+\. )([^\n]+)\n(?!\n|- |\* |\d+\. )/g, '\n$1$2\n\n');
    
  // Enhanced numbered list detection and formatting
  processed = processed
    // Ensure proper spacing for numbered list items
    .replace(/\n(\d+)\.([^\s])/g, '\n$1. $2')
    .replace(/\n(\d+\.) ([^\n]+)\n(?!\n|\d+\. )/g, '\n$1 $2\n\n')
    
    // Convert implicit numbered lists: lines starting with numbers
    .replace(/\n(\d+)[\.:\)][\s]+([^\n]+)(?:\n(?!\n|\d+[\.:\)]))/g, '\n$1. $2\n')
    
    // Find sequences that look like they should be numbered lists
    .replace(/\n([A-Z][^:\n]*?)\s+(\d+)[\.:\)]\s+([^\n]+)(?:\n(?![A-Z]|\d+[\.:\)]))/g, (match, prefix, num, content) => {
      // If this looks like the start of a numbered list, add proper markdown
      return `\n${prefix}\n\n${num}. ${content}\n\n`;
    })
    
    // Detect sequential steps or numbered points even if not in list format
    .replace(/\n(Step|Point|Phase|Stage|Part)(\s+)(\d+)[\s:]+([^\n]+)/gi, '\n$1$2$3: $4\n')
    
    // Convert sequences of Step X: text into proper markdown numbered lists
    .replace(/\n(?:Step|Point|Phase|Stage|Part)(?:\s+)(?:\d+):\s+([^\n]+)(?:\n(?:Step|Point|Phase|Stage|Part)(?:\s+)(?:\d+))/gi, 
      '\n1. $1\n')
    .replace(/\n(?:Step|Point|Phase|Stage|Part)(?:\s+)(?:\d+):\s+([^\n]+)/gi, 
      '\n1. $1\n')
      
    // Ensure all numbered list sequences have consistent format (e.g., "1.", "2.", instead of "1)", "2)")
    .replace(/\n(\d+)[:\)](\s+)([^\n]+)/g, '\n$1.$2$3')
    
    // Convert short numbered sequences that look like lists but don't have proper list formatting
    .replace(/\n(\d+)\.\s+([A-Z][^\n.]+\.)\n(\d+)\.\s+([A-Z][^\n.]+\.)/g, '\n1. $2\n2. $4')
    
    // Fix consecutive numbered points to have proper list format
    .replace(/\n(\d+)\.\s+([^\n]+)\n(?!\n)(\d+)\.\s+([^\n]+)/g, '\n$1. $2\n$3. $4\n');
  
  // Enhanced paragraph spacing & formatting - optimized for article readability
  processed = processed
    // First, normalize all paragraph breaks to double line breaks
    .replace(/\n\n\n+/g, '\n\n')
    
    // Make sure paragraphs are properly separated - this is critical for markdown parsing
    .replace(/([^\n])\n(?!\n|#+\s|\d+\. |- |\* )/g, '$1\n\n')
    
    // Ensure headers have proper spacing before and after
    .replace(/(#+\s+[^\n]+)\n(?!\n)/g, '$1\n\n')
    .replace(/([^\n])\n(#+\s+)/g, '$1\n\n$2')
    
    // Convert lines after colons to lists when appropriate 
    .replace(/:\s*\n\n([A-Z][^.\n]{5,50}\.)\n([A-Z][^.\n]{5,50}\.)/g, ':\n\n- $1\n- $2')
    
    // Ensure proper paragraph breaks after lists
    .replace(/(\n- [^\n]+)(?:\n(?![\n-]))/g, '$1\n\n')
    
    // Make sure list items have proper spacing between them
    .replace(/\n(- [^\n]+)\n(- )/g, '\n$1\n$2')
    
    // Add space between numbered list items too
    .replace(/\n(\d+\. [^\n]+)\n(\d+\. )/g, '\n$1\n$2')
    
    // Ensure proper spacing between list items and following paragraphs
    .replace(/(\n- [^\n]+)\n(?!\n|- |\d+\. |#+\s)/g, '$1\n\n')
    .replace(/(\n\d+\. [^\n]+)\n(?!\n|\d+\. |- |#+\s)/g, '$1\n\n')
    
    // Double check to make sure all paragraphs have proper spacing
    .replace(/(\n\n[^-\n#\d][^\n]+)\n(?!\n)/g, '$1\n\n')
    
    // Ensure all paragraph blocks end with double newlines
    .replace(/([^\n]+)$/g, '$1\n\n')
    
    // Final cleanup for nested lists
    .replace(/\n(- [^\n]+)\n {2,4}(- )/g, '\n$1\n  $2');
  
  return processed;
}

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundArticle = getArticleBySlug(slug);
      if (foundArticle) {
        setArticle(foundArticle);
        // Get recent articles excluding the current one
        const recent = getRecentArticles(4).filter(a => a.id !== foundArticle.id);
        setRecentArticles(recent);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">Article not found. The requested article does not exist or has been removed.</p>
          <Link to="/articles" className="mt-4 inline-flex items-center text-[#0B9444] hover:underline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/articles" className="inline-flex items-center text-[#0B9444] hover:underline font-medium">
            <ArrowLeft size={18} className="mr-2" />
            Back to Articles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Green header accent bar */}
              <div className="h-2 bg-gradient-to-r from-[#0B9444] to-[#39B54A]"></div>
              
              <div className="p-6 md:p-10">
                {/* Article metadata */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 bg-[#DFF3E2] text-[#0B9444] rounded-full text-sm">
                      <Clock size={14} className="mr-1" />
                      {article.readTimeMinutes} min read
                    </span>
                  </div>
                </div>
                
                {/* Article title with visual emphasis */}
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-0 bottom-0 w-1 bg-[#0B9444] rounded-full hidden md:block"></div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#056526] leading-tight md:pl-4">{article.title}</h1>
                </div>
                
                {/* Featured image with enhanced presentation */}
                {article.imageUrl && (
                  <div className="mb-8 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-[#0B9444] opacity-10 rounded-lg transform translate-x-2 translate-y-2"></div>
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="relative w-full h-auto object-cover shadow-md z-10 rounded-xl"
                    />
                  </div>
                )}
                
                {/* Article excerpt - styled as a lead paragraph */}
                <div className="mb-10 bg-gray-50 border-l-4 border-[#0B9444] p-5 rounded-r-lg text-lg text-gray-700 font-medium leading-relaxed">
                  {article.excerpt}
                </div>
                
                {/* Article table of contents for longer articles */}
                {article.content.length > 2000 && (
                  <div className="mb-8 p-5 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-800 mb-3">In this article:</h2>
                    <div className="text-[#0B9444] space-y-2">
                      {/* Simple TOC generation based on markdown h2s */}
                      {article.content.match(/^##\s+(.+)$/gm)?.map((match, index) => {
                        const title = match.replace(/^##\s+/, '');
                        return (
                          <div key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-[#0B9444] rounded-full mr-2"></div>
                            <span className="hover:underline cursor-pointer">{title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Article content with professional typography */}
                <div className="article-content">
                  <style jsx="true">{`
                    .article-content ul {
                      list-style-type: disc !important;
                      margin: 1.5rem 0;
                      padding-left: 3rem !important; /* Increased indentation */
                    }
                    .article-content ol {
                      list-style-type: decimal !important;
                      margin: 1.5rem 0;
                      padding-left: 3rem !important; /* Increased indentation */
                    }
                    .article-content li {
                      margin: 0.75rem 0;
                      padding-left: 0.5rem;
                      color: #374151;
                      line-height: 1.6;
                      display: list-item !important;
                    }
                    .article-content li::marker {
                      color: #0B9444;
                      font-weight: 600;
                    }
                    .article-content li:hover {
                      background-color: #f9fafb;
                      border-radius: 0.125rem;
                    }
                    
                    /* Nested lists styling */
                    .article-content li > ul,
                    .article-content li > ol {
                      margin: 0.5rem 0 0.5rem 1rem !important;
                    }
                    .article-content li > ul {
                      list-style-type: circle !important;
                    }
                    .article-content li > ul > li > ul {
                      list-style-type: square !important;
                    }
                    
                    /* We need to explicitly style indented lists that don't have proper nesting markup */
                    .article-content ul li ul {
                      margin-left: 1.5rem;
                    }
                    
                    /* Force second-level bullets to have proper styling */
                    .article-content ul li ul li::before {
                      content: "◦";
                      color: #0B9444;
                      font-weight: bold;
                      display: inline-block;
                      width: 1em;
                      margin-left: -1em;
                    }
                    
                    .article-content h1 {
                      font-size: 1.875rem;
                      font-weight: 700;
                      color: #056526;
                      margin-bottom: 2rem;
                    }
                    .article-content h2 {
                      font-size: 1.5rem;
                      font-weight: 700;
                      color: #056526;
                      margin-top: 3rem;
                      margin-bottom: 1.5rem;
                    }
                    .article-content h3 {
                      font-size: 1.25rem;
                      font-weight: 700;
                      color: #056526;
                      margin-top: 2.5rem;
                      margin-bottom: 1rem;
                    }
                    .article-content p {
                      font-size: 1rem;
                      margin: 2rem 0;
                      line-height: 1.7;
                      color: #4b5563;
                    }
                    .article-content a {
                      color: #0B9444;
                      font-weight: 500;
                      text-decoration: none;
                      border-bottom: 1px solid #0B9444;
                    }
                    .article-content a:hover {
                      color: #056526;
                    }
                    .article-content strong {
                      color: #1f2937;
                      font-weight: 600;
                    }
                    .article-content blockquote {
                      border-left: 4px solid #0B9444;
                      background-color: #f9fafb;
                      padding: 0.5rem 0 0.5rem 1rem;
                      font-style: italic;
                    }
                    
                    /* Direct fixes for specific patterns */
                    .article-content h3 + ul {
                      list-style-type: disc !important;
                      margin-top: 1rem !important;
                    }
                    
                    /* Make sure all list items show their bullets */
                    .article-content ul li {
                      display: list-item !important;
                      list-style: disc outside !important;
                    }
                    
                    .article-content ol li {
                      display: list-item !important;
                      list-style: decimal outside !important;
                    }
                    
                    /* Special handling for nutrition article */
                    .article-content h3 + p > strong {
                      font-weight: 600;
                      font-size: 1.1rem;
                      color: #056526;
                    }
                    
                    /* Override for asterisk bullets to ensure they show properly */
                    .article-content p {
                      margin-bottom: 0.5rem;
                    }
                    .article-content p:has(+ ul) {
                      margin-bottom: 0.5rem;
                    }
                    /* Make sure * bullets are properly displayed */
                    .article-content ul {
                      list-style-type: disc !important;
                      padding-left: 2rem !important;
                      margin-top: 0.5rem !important;
                      margin-bottom: 1.5rem !important;
                    }
                    
                    /* Special styling for nutrient lists */
                    .article-content .nutrient-title {
                      font-weight: 600;
                      color: #056526;
                      margin-bottom: 0.25rem;
                      margin-top: 1.5rem;
                    }
                    
                    .article-content .nutrient-list {
                      padding-left: 3.5rem !important;
                      margin-top: 0.25rem !important;
                      margin-bottom: 1.5rem !important;
                    }
                    
                    .article-content .nutrient-list li {
                      margin-top: 0.5rem;
                      margin-bottom: 0.5rem;
                    }
                    
                    /* Special styling for care tips lists */
                    .article-content .care-tips-list {
                      padding-left: 3.5rem !important;
                    }
                    
                    /* Special styling for fertilizer lists */
                    .article-content .fertilizer-type {
                      margin-bottom: 0.25rem;
                      margin-top: 1.5rem;
                    }
                    
                    .article-content .fertilizer-list {
                      padding-left: 3.5rem !important;
                    }
                  `}</style>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: article.slug === 'understanding-plant-nutrition' 
                        ? marked(processContent(article.content), { 
                            breaks: true,
                            gfm: true,
                            pedantic: false,
                            headerIds: true,
                            mangle: false
                          })
                          // Primary Macronutrients
                          .replace(
                            /<p><strong>Nitrogen \(N\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Nitrogen (N)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                              <li>$4</li>
                            </ul>`
                          )
                          .replace(
                            /<p><strong>Phosphorus \(P\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Phosphorus (P)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                              <li>$4</li>
                            </ul>`
                          )
                          .replace(
                            /<p><strong>Potassium \(K\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Potassium (K)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                              <li>$4</li>
                            </ul>`
                          )
                          
                          // Secondary Macronutrients
                          .replace(
                            /<p><strong>Calcium \(Ca\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Calcium (Ca)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                            </ul>`
                          )
                          .replace(
                            /<p><strong>Magnesium \(Mg\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Magnesium (Mg)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                            </ul>`
                          )
                          .replace(
                            /<p><strong>Sulfur \(S\)<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="nutrient-title"><strong>Sulfur (S)</strong></p>
                            <ul class="nutrient-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                            </ul>`
                          )
                          
                          // Fix "Types of Fertilizers" sections
                          .replace(
                            /<p><strong>(Organic|Synthetic|Chemical|Slow-Release|Liquid) Fertilizers<\/strong><\/p>\n<p>([^<]+)<\/p>/g,
                            `<p class="fertilizer-type"><strong>$1 Fertilizers</strong></p>
                            <ul class="fertilizer-list">
                              <li>$2</li>
                            </ul>`
                          )
                          
                          // Fix "Care tips" sections
                          .replace(
                            /<p><strong>Care tips:<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p><strong>Care tips:</strong></p>
                            <ul class="care-tips-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                              <li>$4</li>
                            </ul>`
                          )
                        : marked(processContent(article.content), { 
                            breaks: true,
                            gfm: true,
                            pedantic: false,
                            headerIds: true,
                            mangle: false
                          })
                          // Fix "Care tips" sections in all articles
                          .replace(
                            /<p><strong>Care tips:<\/strong><\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>\n<p>([^<]+)<\/p>/g,
                            `<p><strong>Care tips:</strong></p>
                            <ul class="care-tips-list">
                              <li>$1</li>
                              <li>$2</li>
                              <li>$3</li>
                              <li>$4</li>
                            </ul>`
                          )
                    }}
                  />
                </div>
                
                {/* Article footer with navigation */}
                <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-center">
                  <Link to="/articles" className="inline-flex items-center bg-[#DFF3E2] hover:bg-[#0B9444] text-[#0B9444] hover:text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Return to Articles
                  </Link>
                </div>
              </div>
            </article>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Recent Articles Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                {/* Header accent bar */}
                <div className="h-2 bg-gradient-to-r from-[#0B9444] to-[#39B54A]"></div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-[#DFF3E2] rounded-full">
                      <BookOpen size={18} className="text-[#0B9444]" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Recent Articles</h2>
                  </div>
                  
                  <div className="space-y-4 divide-y divide-gray-100">
                    {recentArticles.map(recentArticle => (
                      <Link 
                        key={recentArticle.id} 
                        to={`/articles/${recentArticle.slug}`}
                        className="block hover:bg-gray-50 p-3 rounded-lg transition-colors block pt-4 first:pt-0"
                      >
                        <h3 className="font-medium text-gray-800 hover:text-[#0B9444] line-clamp-2 text-base">{recentArticle.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{recentArticle.excerpt}</p>
                        <div className="flex items-center text-xs text-[#0B9444] mt-2 font-medium">
                          <Clock size={12} className="mr-1" />
                          <span>{recentArticle.readTimeMinutes} min read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link 
                      to="/articles" 
                      className="inline-flex items-center bg-[#DFF3E2] text-[#0B9444] hover:bg-[#0B9444] hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all w-full justify-center"
                    >
                      View all articles
                    </Link>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;