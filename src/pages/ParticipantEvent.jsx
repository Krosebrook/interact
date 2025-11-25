import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import CollaborativeWhiteboard from '../components/interactive/CollaborativeWhiteboard';
import BreakoutRooms from '../components/interactive/BreakoutRooms';
import MultiplayerGame from '../components/interactive/MultiplayerGame';
import EventMediaGallery from '../components/events/EventMediaGallery';
import LiveQASection from '../components/events/LiveQASection';
import EventRecordingPlayer from '../components/events/EventRecordingPlayer';
import BookmarkButton from '../components/events/BookmarkButton';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  Star,
  Upload,
  Send,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ParticipantEvent() {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState(null);
  const [participantData, setParticipantData] = useState({
    participant_name: '',
    participant_email: '',
    rsvp_status: 'yes'
  });
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [submission, setSubmission] = useState({ content: '', file_url: '' });
  const [feedback, setFeedback] = useState({ engagement_score: 5, feedback: '' });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventParam = urlParams.get('event') || urlParams.get('link');
    setEventId(eventParam);
  }, []);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ magic_link: eventId });
      return events[0] || null;
    },
    enabled: !!eventId
  });

  const { data: activity } = useQuery({
    queryKey: ['activity', event?.activity_id],
    queryFn: () => base44.entities.Activity.filter({ id: event.activity_id }).then(r => r[0]),
    enabled: !!event?.activity_id
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['participations', event?.id],
    queryFn: () => base44.entities.Participation.filter({ event_id: event.id }),
    enabled: !!event?.id
  });

  const rsvpMutation = useMutation({
    mutationFn: (data) => base44.entities.Participation.create({
      event_id: event.id,
      ...data,
      attended: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['participations']);
      setHasRSVPd(true);
      toast.success('RSVP confirmed! 🎉');
    }
  });

  const submitActivityMutation = useMutation({
    mutationFn: async ({ participationId, data }) => {
      return base44.entities.Participation.update(participationId, {
        submission: data,
        attended: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['participations']);
      toast.success('Submission recorded!');
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ participationId, data }) => {
      return base44.entities.Participation.update(participationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['participations']);
      toast.success('Thank you for your feedback! ⭐');
    }
  });

  const handleRSVP = (e) => {
    e.preventDefault();
    rsvpMutation.mutate(participantData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSubmission(prev => ({ ...prev, file_url }));
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitActivity = () => {
    const myParticipation = participations.find(
      p => p.participant_email === participantData.participant_email
    );
    if (myParticipation) {
      submitActivityMutation.mutate({
        participationId: myParticipation.id,
        data: {
          type: activity?.interaction_type || 'text_submission',
          content: submission.content,
          file_url: submission.file_url
        }
      });
    }
  };

  const handleSubmitFeedback = () => {
    const myParticipation = participations.find(
      p => p.participant_email === participantData.participant_email
    );
    if (myParticipation) {
      submitFeedbackMutation.mutate({
        participationId: myParticipation.id,
        data: feedback
      });
    }
  };

  if (!eventId || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading event...</h2>
        </div>
      </div>
    );
  }

  const myParticipation = participations.find(
    p => p.participant_email === participantData.participant_email
  );
  const hasSubmitted = myParticipation?.attended;
  const hasFeedback = myParticipation?.engagement_score;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Event Header */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
            <Badge className="bg-white/20 text-white border-0 mb-4">
              {activity?.type}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(event.scheduled_date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{format(new Date(event.scheduled_date), 'h:mm a')}</span>
                <span className="opacity-75">• {activity?.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{participations.length} people are joining</span>
              </div>
            </div>
          </div>

          {/* Activity Description */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">About This Activity</h2>
            <p className="text-slate-600 mb-4">{activity?.description}</p>
            
            {activity?.instructions && (
              <>
                <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
                <p className="text-slate-600 whitespace-pre-wrap mb-4">{activity.instructions}</p>
              </>
            )}

            {activity?.materials_needed && (
              <>
                <h3 className="font-semibold text-slate-900 mb-2">What You'll Need</h3>
                <p className="text-slate-600">{activity.materials_needed}</p>
              </>
            )}

            {event.meeting_link && (
              <div className="mt-6">
                <a
                  href={event.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Join Video Call
                </a>
              </div>
            )}

            {/* Bookmark Button */}
            {participantData.participant_email && (
              <div className="mt-4">
                <BookmarkButton 
                  eventId={event.id} 
                  userEmail={participantData.participant_email}
                  variant="outline"
                  size="default"
                  showLabel={true}
                />
              </div>
            )}
          </div>
        </Card>

        {/* RSVP Form */}
        {!hasRSVPd && !myParticipation && (
          <Card className="p-8 border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              <CheckCircle className="inline h-6 w-6 mr-2 text-emerald-600" />
              RSVP for this Event
            </h2>
            <form onSubmit={handleRSVP} className="space-y-4">
              <div>
                <Label>Your Name</Label>
                <Input
                  value={participantData.participant_name}
                  onChange={(e) => setParticipantData(prev => ({ ...prev, participant_name: e.target.value }))}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={participantData.participant_email}
                  onChange={(e) => setParticipantData(prev => ({ ...prev, participant_email: e.target.value }))}
                  required
                  placeholder="your.email@company.com"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6">
                Confirm RSVP
              </Button>
            </form>
          </Card>
        )}

        {/* Interactive Activity Submission */}
        {myParticipation && !hasSubmitted && (
          <>
            {activity?.interaction_type === 'whiteboard' && (
              <CollaborativeWhiteboard
                participantName={participantData.participant_name}
                onSave={(imageData) => {
                  setSubmission({ content: 'Whiteboard drawing submitted', file_url: imageData });
                  handleSubmitActivity();
                }}
              />
            )}

            {activity?.interaction_type === 'breakout_rooms' && (
              <BreakoutRooms
                participantName={participantData.participant_name}
                participantEmail={participantData.participant_email}
                allParticipants={participations}
                onSubmit={(discussionData) => {
                  setSubmission({ content: JSON.stringify(discussionData) });
                  submitActivityMutation.mutate({
                    participationId: myParticipation.id,
                    data: discussionData
                  });
                }}
              />
            )}

            {activity?.interaction_type === 'multiplayer_game' && (
              <MultiplayerGame
                participantName={participantData.participant_name}
                onComplete={(gameResults) => {
                  setSubmission({ content: JSON.stringify(gameResults) });
                  submitActivityMutation.mutate({
                    participationId: myParticipation.id,
                    data: gameResults
                  });
                }}
              />
            )}

            {!['whiteboard', 'breakout_rooms', 'multiplayer_game'].includes(activity?.interaction_type) && (
              <Card className="p-8 border-0 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  <Send className="inline h-6 w-6 mr-2 text-indigo-600" />
                  Submit Your Response
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>Your Submission</Label>
                    <Textarea
                      value={submission.content}
                      onChange={(e) => setSubmission(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your response, ideas, or answer..."
                      rows={4}
                    />
                  </div>
                  
                  {activity?.interaction_type === 'photo_upload' && (
                    <div>
                      <Label>Upload Photo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                      {uploadingFile && <p className="text-sm text-slate-500 mt-1">Uploading...</p>}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitActivity}
                    disabled={!submission.content && !submission.file_url}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Live Q&A Section - Show during active events */}
        {myParticipation && (event.status === 'in_progress' || event.status === 'scheduled') && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                Live Chat & Q&A
              </h2>
            </div>
            <div className="h-[400px]">
              <LiveQASection
                eventId={event.id}
                userEmail={participantData.participant_email}
                userName={participantData.participant_name}
                isHost={false}
              />
            </div>
          </Card>
        )}

        {/* Event Media Gallery */}
        {myParticipation && (event.status === 'in_progress' || event.status === 'completed') && (
          <EventMediaGallery 
            eventId={event.id}
            canUpload={true}
          />
        )}

        {/* Event Recordings - Show for past events */}
        {event.status === 'completed' && (
          <Card className="p-6 border-0 shadow-lg">
            <EventRecordingPlayer
              eventId={event.id}
              eventTitle={event.title}
              isHost={false}
              userEmail={participantData.participant_email}
            />
          </Card>
        )}

        {/* Feedback Form */}
        {myParticipation && hasSubmitted && !hasFeedback && (
          <Card className="p-8 border-0 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              <Star className="inline h-6 w-6 mr-2 text-yellow-500" />
              Share Your Feedback
            </h2>
            <div className="space-y-4">
              <div>
                <Label>How engaged were you? (1-5 stars)</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, engagement_score: score }))}
                      className="transition"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          score <= feedback.engagement_score
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Additional Comments (optional)</Label>
                <Textarea
                  value={feedback.feedback}
                  onChange={(e) => setFeedback(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="What did you enjoy? Any suggestions?"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmitFeedback}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Feedback
              </Button>
            </div>
          </Card>
        )}

        {/* Completion */}
        {myParticipation && hasFeedback && (
          <Card className="p-8 border-0 shadow-lg text-center">
            <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You! 🎉</h2>
            <p className="text-slate-600">
              Your participation and feedback have been recorded. We appreciate your engagement!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}