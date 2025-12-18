import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!isMounted) return;
        
        setUser(currentUser);
        
        // If admin, redirect to admin dashboard
        if (currentUser.role === 'admin') {
          navigate(createPageUrl('Dashboard'), { replace: true });
          return;
        }
        
        // If user already has a user_type, redirect appropriately
        if (currentUser.user_type === 'facilitator') {
          navigate(createPageUrl('FacilitatorDashboard'), { replace: true });
          return;
        }
        if (currentUser.user_type === 'participant') {
          navigate(createPageUrl('ParticipantPortal'), { replace: true });
          return;
        }
      } catch (error) {
        if (isMounted) {
          base44.auth.redirectToLogin();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadUser();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleSelectRole = async (roleType) => {
    setSelecting(true);
    setSelectedRole(roleType);
    
    try {
      await base44.auth.updateMe({ user_type: roleType });
      toast.success(`Welcome! You're now set up as a ${roleType}.`);
      
      // Redirect based on selection
      if (roleType === 'facilitator') {
        navigate(createPageUrl('FacilitatorDashboard'));
      } else {
        navigate(createPageUrl('ParticipantPortal'));
      }
    } catch (error) {
      toast.error('Failed to save your selection. Please try again.');
      setSelecting(false);
      setSelectedRole(null);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-int-orange to-orange-600 mb-6 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-int-navy mb-4">
            Welcome to INTeract, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Let's get you set up. How will you be using the platform?
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Facilitator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                selectedRole === 'facilitator' 
                  ? 'border-int-orange bg-orange-50 shadow-xl' 
                  : 'border-transparent hover:border-int-orange/50'
              }`}
              onClick={() => !selecting && handleSelectRole('facilitator')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-int-orange to-orange-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  {selectedRole === 'facilitator' && (
                    <CheckCircle className="h-6 w-6 text-int-orange" />
                  )}
                </div>
                <CardTitle className="text-2xl text-int-navy mt-4">I'm a Facilitator</CardTitle>
                <CardDescription className="text-base">
                  I organize and run team activities and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-int-orange" />
                    </div>
                    <span>Schedule and manage team events</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-int-orange" />
                    </div>
                    <span>Track participation and engagement</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-int-orange" />
                    </div>
                    <span>View analytics and insights</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-int-orange hover:bg-[#C46322] text-white"
                  disabled={selecting}
                >
                  {selecting && selectedRole === 'facilitator' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    'Continue as Facilitator'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Participant Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                selectedRole === 'participant' 
                  ? 'border-int-navy bg-blue-50 shadow-xl' 
                  : 'border-transparent hover:border-int-navy/50'
              }`}
              onClick={() => !selecting && handleSelectRole('participant')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-int-navy to-blue-700 flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  {selectedRole === 'participant' && (
                    <CheckCircle className="h-6 w-6 text-int-navy" />
                  )}
                </div>
                <CardTitle className="text-2xl text-int-navy mt-4">I'm a Participant</CardTitle>
                <CardDescription className="text-base">
                  I attend team activities and earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-int-navy" />
                    </div>
                    <span>Join team events and activities</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-int-navy" />
                    </div>
                    <span>Earn points and unlock rewards</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-int-navy" />
                    </div>
                    <span>Compete on leaderboards</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-int-navy hover:bg-[#1e3a6d] text-white"
                  disabled={selecting}
                >
                  {selecting && selectedRole === 'participant' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    'Continue as Participant'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-slate-500 mt-8 text-sm"
        >
          You can change this later in your profile settings.
        </motion.p>
      </div>
    </div>
  );
}