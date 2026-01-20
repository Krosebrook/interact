import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserData } from '../components/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Tag, FolderOpen, Edit, Trash, ArrowLeft } from 'lucide-react';
import KnowledgeBaseSearch from '../components/knowledge/KnowledgeBaseSearch';
import ArticleEditor from '../components/knowledge/ArticleEditor';

export default function KnowledgeBase() {
  const { user } = useUserData();
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewingArticle, setViewingArticle] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const articleIdFromUrl = urlParams.get('article');

  const { data: articles } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: async () => await base44.entities.KnowledgeBase.list('-updated_date'),
    initialData: []
  });

  const { data: articleToView } = useQuery({
    queryKey: ['kb-article', articleIdFromUrl],
    queryFn: async () => {
      if (!articleIdFromUrl) return null;
      return await base44.entities.KnowledgeBase.get(articleIdFromUrl);
    },
    enabled: !!articleIdFromUrl
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await base44.entities.KnowledgeBase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-base']);
      setViewingArticle(null);
    }
  });

  const publishedArticles = articles.filter(a => a.status === 'published');
  const categories = [...new Set(publishedArticles.map(a => a.category))];
  const allTags = [...new Set(publishedArticles.flatMap(a => a.tags || []))];

  const canEdit = user?.role === 'admin' || user?.user_type === 'facilitator';

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const displayArticle = articleToView || viewingArticle;

  if (showEditor) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setShowEditor(false); setEditingArticle(null); }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Base
        </Button>
        <ArticleEditor article={editingArticle} onClose={() => { setShowEditor(false); setEditingArticle(null); }} />
      </div>
    );
  }

  if (displayArticle) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setViewingArticle(null); window.history.pushState({}, '', createPageUrl('KnowledgeBase')); }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Base
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{displayArticle.title}</CardTitle>
                <p className="text-slate-600">{displayArticle.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge>{displayArticle.category}</Badge>
                  {displayArticle.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(displayArticle)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(displayArticle.id)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: displayArticle.content }} />
            <div className="mt-6 pt-6 border-t text-sm text-slate-500">
              Last updated: {new Date(displayArticle.updated_date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            Knowledge Base
          </h1>
          <p className="text-slate-600 mt-1">Search and explore company documentation</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        )}
      </div>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          {canEdit && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <KnowledgeBaseSearch selectedCategories={selectedCategories} selectedTags={selectedTags} />
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedCategories([cat])}
                  >
                    {cat}
                    <Badge variant="outline" className="ml-auto">
                      {publishedArticles.filter(a => a.category === cat).length}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="col-span-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-100"
                    onClick={() => setSelectedTags([tag])}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <KnowledgeBaseSearch selectedCategories={selectedCategories} selectedTags={selectedTags} />
            </div>
          </div>
        </TabsContent>

        {canEdit && (
          <TabsContent value="manage" className="space-y-4">
            <div className="grid gap-3">
              {articles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{article.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{article.summary}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{article.category}</Badge>
                          <Badge className={article.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {article.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(article.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}