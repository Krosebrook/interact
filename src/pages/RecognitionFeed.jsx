import RecognitionFeed from '../components/social/RecognitionFeed';

export default function RecognitionFeedPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Recognition Feed</h1>
        <p className="text-slate-600 mt-1">Celebrate achievements and milestones together</p>
      </div>
      
      <RecognitionFeed />
    </div>
  );
}