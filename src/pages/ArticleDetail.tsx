import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article, getArticleBySlug, getRecentArticles } from '../data/mockArticles';
import { ArrowLeft, Clock, BookOpen, ChevronLeft, Share2, Bookmark } from 'lucide-react';
import { marked } from 'marked';

/**
 * Advanced content processor for optimal article display
 * Ensures professionally formatted content with proper spacing,
 * list formatting, and typographic improvements
 */
function processContent(content: string): string {
  if (!content) return '';
  
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
  
  // Handle sequential capitalized sentences after a colon as list items
  processed = processed.replace(
    /([.:])\s*\n\s*\n([A-Z][^#\n.]+[.!?])\s*\n\s*([A-Z][^#\n.]+[.!?])/g,
    (match, endChar, line1, line2) => {
      // Skip if lines are very long (likely paragraphs, not list items)
      if (line1.length > 120 || line2.length > 120) return match;
      return `${endChar}\n\n- ${line1.trim()}\n- ${line2.trim()}`;
    }
  );
  
  // 2. Lines after list indicator phrases
  const listIndicators = [
    'include', 'such as', 'examples', 'following', 'signs', 'symptoms',
    'benefits', 'advantages', 'features', 'reasons', 'steps', 'tips', 'ways'
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
    
  // Fix numbered list formatting
  processed = processed
    .replace(/\n(\d+)\.([^\s])/g, '\n$1. $2')
    .replace(/\n(\d+\.) ([^\n]+)\n(?!\n|\d+\. )/g, '\n$1 $2\n\n');
  
  // Ensure consistent paragraph spacing
  processed = processed
    // First, normalize all paragraph breaks to double line breaks
    .replace(/\n\n\n+/g, '\n\n')
    // Ensure single line breaks within paragraphs don't create new paragraphs
    .replace(/([^\n])\n(?!\n|#+\s|\d+\. |- |\* )/g, '$1\n\n')
    // Make sure there's proper spacing between headers and paragraphs
    .replace(/(#+\s+[^\n]+)\n(?!\n)/g, '$1\n\n')
    // Ensure proper paragraph breaks after lists
    .replace(/(\n- [^\n]+)(?:\n(?![\n-]))/g, '$1\n\n')
    // Make sure list items have proper spacing
    .replace(/\n(- [^\n]+)\n(- )/g, '\n$1\n\n$2');
  
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
                {/* Article metadata and sharing */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 bg-[#DFF3E2] text-[#0B9444] rounded-full text-sm">
                      <Clock size={14} className="mr-1" />
                      {article.readTimeMinutes} min read
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Share article">
                      <Share2 size={18} className="text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Save article">
                      <Bookmark size={18} className="text-gray-500" />
                    </button>
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
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-[#056526] prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-8 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-a:text-[#0B9444] prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-[#0B9444] hover:prose-a:text-[#056526] prose-strong:text-gray-800 prose-p:text-base prose-p:my-8 prose-p:leading-relaxed prose-p:text-gray-700 prose-ul:list-disc prose-ul:pl-6 prose-ul:my-8 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-8 prose-blockquote:border-l-4 prose-blockquote:border-l-[#0B9444] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:italic prose-li:mb-4 prose-li:pl-2"
                  dangerouslySetInnerHTML={{ __html: marked(processContent(article.content), { breaks: true }) }}
                ></div>
                
                {/* Article footer with navigation and social sharing */}
                <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between">
                  <Link to="/articles" className="inline-flex items-center bg-[#DFF3E2] hover:bg-[#0B9444] text-[#0B9444] hover:text-white py-2 px-4 rounded-lg font-medium transition-colors mb-3 md:mb-0">
                    <ArrowLeft size={18} className="mr-2" />
                    Return to Articles
                  </Link>
                  
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
                      <Share2 size={16} className="mr-2" />
                      Share
                    </button>
                    <button className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
                      <Bookmark size={16} className="mr-2" />
                      Save
                    </button>
                  </div>
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