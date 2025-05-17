import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Leaf, Droplets, ExternalLink, Search, Clock } from 'lucide-react';
import { categories, getArticlesByCategory, Article } from '../data/mockArticles';

const Articles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articlesByCategory, setArticlesByCategory] = useState<{ [key: string]: Article[] }>({});

  useEffect(() => {
    // Load articles by category
    const articlesByCat: { [key: string]: Article[] } = {};
    categories.forEach(category => {
      articlesByCat[category.id] = getArticlesByCategory(category.id);
    });
    setArticlesByCategory(articlesByCat);
  }, []);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'indoor-plants':
        return <Leaf size={24} className="text-[#0B9444]" />;
      case 'plant-care':
        return <Droplets size={24} className="text-[#0B9444]" />;
      case 'seasonal-tips':
        return <BookOpen size={24} className="text-[#0B9444]" />;
      default:
        return <BookOpen size={24} className="text-[#0B9444]" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#056526] mb-4">Plant Articles</h1>
        <p className="text-gray-600 mt-1 text-lg">Explore our collection of expert tips and guides for better plant care</p>
      </div>

      <div className="mb-10 max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-[#DFF3E2] p-5">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white rounded-full">
                  {getCategoryIcon(category.id)}
                </div>
                <h2 className="text-xl font-semibold text-[#056526]">{category.title}</h2>
              </div>
            </div>
            <div className="p-5">
              <ul className="space-y-4">
                {articlesByCategory[category.id]?.map((article) => (
                  <li key={article.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <Link 
                      to={`/articles/${article.slug}`}
                      className="block hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-800 hover:text-[#0B9444] text-base">{article.title}</h3>
                        <ExternalLink size={16} className="text-[#0B9444] flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        <span>{article.readTimeMinutes} min read</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Articles;