import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Users, TrendingUp, MessageSquare, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function EventReportViewer({ eventId, eventTitle }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('exportEventReport', { eventId });
      setReport(data.report);
      setOpen(true);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportText = JSON.stringify(report, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-report-${eventId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          generateReport();
        }}
        disabled={loading}
        className="w-full text-left"
      >
        {loading ? 'Generating...' : 'View Report'}
      </button>

      <Dialog open={open} onOpenChange={setOpen} data-b44-sync="true" data-feature="events" data-component="eventreportviewer">
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Event Report: {eventTitle}</DialogTitle>
              <Button onClick={downloadReport} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </DialogHeader>

          {report && (
            <div className="space-y-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Activity Type:</span>
                      <span className="ml-2 font-medium">{report.event.activity_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Duration:</span>
                      <span className="ml-2 font-medium">{report.event.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Date:</span>
                      <span className="ml-2 font-medium">{report.event.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Status:</span>
                      <span className="ml-2 font-medium capitalize">{report.event.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participation Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Attendance Rate</p>
                        <p className="text-3xl font-bold text-int-navy">{report.participation.attendance_rate}</p>
                      </div>
                      <Users className="h-8 w-8 text-int-navy" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Avg Engagement</p>
                        <p className="text-3xl font-bold text-int-orange">{report.engagement.average_score}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-int-orange" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Media Uploads</p>
                        <p className="text-3xl font-bold text-int-navy">{report.media.total_uploads}</p>
                      </div>
                      <Camera className="h-8 w-8 text-int-navy" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{report.engagement.sentiment.positive}</p>
                      <p className="text-sm text-green-700">Positive (4-5 ⭐)</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{report.engagement.sentiment.neutral}</p>
                      <p className="text-sm text-yellow-700">Neutral (3 ⭐)</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{report.engagement.sentiment.negative}</p>
                      <p className="text-sm text-red-700">Needs Work (1-2 ⭐)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Feedback */}
              {report.top_feedback.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {report.top_feedback.map((fb, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm">{fb.name}</p>
                          <span className="text-yellow-500">{'⭐'.repeat(fb.score)}</span>
                        </div>
                        <p className="text-sm text-slate-600 italic">"{fb.feedback}"</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Detailed Participant List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participant Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">RSVP</th>
                          <th className="text-left p-2">Attended</th>
                          <th className="text-left p-2">Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.participant_details.map((p, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{p.name}</td>
                            <td className="p-2 capitalize">{p.rsvp}</td>
                            <td className="p-2">{p.attended ? '✅' : '❌'}</td>
                            <td className="p-2">{p.engagement_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}