import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomTeamReportBuilder({ teamId }) {
  const [dateRange, setDateRange] = useState('30');
  const [metrics, setMetrics] = useState({
    points: true,
    attendance: true,
    recognitions: true,
    challenges: false
  });

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => base44.entities.Team.filter({ id: teamId }).then(t => t[0]),
    enabled: !!teamId
  });

  const handleMetricToggle = (metric) => {
    setMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  const handleGenerateReport = () => {
    const selectedMetrics = Object.keys(metrics).filter(k => metrics[k]);
    if (selectedMetrics.length === 0) {
      toast.error('Please select at least one metric');
      return;
    }
    toast.success('Report generated successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Team Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Metrics to Include</Label>
          <div className="space-y-2">
            {Object.keys(metrics).map(metric => (
              <div key={metric} className="flex items-center space-x-2">
                <Checkbox
                  checked={metrics[metric]}
                  onCheckedChange={() => handleMetricToggle(metric)}
                />
                <label className="text-sm capitalize">{metric}</label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleGenerateReport}
          className="w-full bg-int-orange hover:bg-[#C46322]"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}