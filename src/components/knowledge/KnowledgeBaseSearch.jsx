import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Tag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function KnowledgeBaseSearch({ selectedCategories, selectedTags }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['kb-search', debouncedQuery, selectedCategories, selectedTags],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiKnowledgeSearch', {
        query: debouncedQuery,
        categories: selectedCategories,
        tags: selectedTags
      });
      return response.data;
    },
    enabled: true
  });

  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          <Sparkles className="w-4 h-4 mr-2" />
          AI Search
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-slate-500">Searching...</div>
      )}

      {data && (
        <div className="space-y-3">
          {data.reasoning && debouncedQuery && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4">
                <p className="text-sm text-purple-900">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  {data.reasoning}
                </p>
              </CardContent>
            </Card>
          )}

          {data.results?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                No articles found. Try different keywords.
              </CardContent>
            </Card>
          )}

          {data.results?.map((article) => (
            <Link key={article.id} to={`${createPageUrl('KnowledgeBase')}?article=${article.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{article.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{article.summary}</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-purple-600 ml-4 flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{article.category}</Badge>
                    {article.tags?.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} className="bg-slate-100 text-slate-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}