import RecognitionFeed from '../components/social/RecognitionFeed';

export default function RecognitionFeedPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold text-int-navy">Recognition Feed</h1>
        <p className="text-slate-600 mt-1">Celebrate achievements and milestones together</p>
      </div>
      
      <RecognitionFeed />
    </div>
  );
}