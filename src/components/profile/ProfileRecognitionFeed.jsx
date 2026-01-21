import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfileRecognitionFeed({ userEmail }) {
  const { data: recognitions = [] } = useQuery({
    queryKey: ['user-recognitions', userEmail],
    queryFn: async () => {
      const allRecognitions = await base44.entities.Recognition.list('-created_date', 20);
      return allRecognitions.filter(r => r.recipient_email === userEmail);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Recent Recognition
          <Badge className="ml-auto">{recognitions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recognitions.length === 0 ? (
          <p className="text-sm text-slate-600">No recognition received yet</p>
        ) : (
          recognitions.slice(0, 5).map((recognition) => (
            <div
              key={recognition.id}
              className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {recognition.giver_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{recognition.giver_name}</span>
                    <span className="text-sm text-slate-600">
                      {new Date(recognition.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{recognition.message}</p>
                  {recognition.category && (
                    <Badge className="bg-pink-100 text-pink-800 text-xs">
                      {recognition.category}
                    </Badge>
                  )}
                </div>
              </div>
              {recognition.reactions && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-red-200">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Heart className="w-4 h-4" />
                    {Object.values(recognition.reactions).reduce((sum, count) => sum + count, 0)}
                  </div>
                  {recognition.comment_count > 0 && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MessageCircle className="w-4 h-4" />
                      {recognition.comment_count}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}