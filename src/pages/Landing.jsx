import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Heart,
  TrendingUp,
  Award,
  MessageCircle,
  Calendar,
  BarChart3,
  ArrowRight,
  Check,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Heart,
      title: 'Peer Recognition',
      description: 'Celebrate wins and build culture with public shoutouts and kudos.',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: MessageCircle,
      title: 'Pulse Surveys',
      description: 'Anonymous feedback to measure sentiment and gather insights.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Team Channels',
      description: 'Collaborate with your department in dedicated spaces.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Calendar,
      title: 'Virtual Events',
      description: 'Team building activities, workshops, and social gatherings.',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: TrendingUp,
      title: 'Wellness Challenges',
      description: 'Opt-in health goals with team competitions and rewards.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'HR Analytics',
      description: 'Measure engagement trends and team health metrics.',
      gradient: 'from-slate-500 to-gray-500',
    },
  ];

  const stats = [
    { value: '95%', label: 'Employee Satisfaction' },
    { value: '3x', label: 'Engagement Increase' },
    { value: '50+', label: 'Companies Trust Us' },
    { value: '24/7', label: 'Platform Availability' },
  ];

  const benefits = [
    'Boost team morale and culture',
    'Increase employee retention',
    'Measure engagement in real-time',
    'Foster remote team connections',
    'Recognize achievements instantly',
    'Gather anonymous feedback',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Splash')} className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">INTeract</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-700 hover:text-[#FF8A3D] transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-slate-700 hover:text-[#FF8A3D] transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-slate-700 hover:text-[#FF8A3D] transition-colors">
                Pricing
              </a>
              <Button 
                onClick={() => {
                  console.log('[LANDING] Redirecting to login...');
                  base44.auth.redirectToLogin(createPageUrl('Dashboard'));
                }}
                className="bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] hover:from-[#FFB86C] hover:to-[#FF8A3D] text-white"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block py-2 text-slate-700 hover:text-[#FF8A3D]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block py-2 text-slate-700 hover:text-[#FF8A3D]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="#pricing"
                className="block py-2 text-slate-700 hover:text-[#FF8A3D]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Button 
                onClick={() => {
                  console.log('[LANDING] Redirecting to login...');
                  base44.auth.redirectToLogin(createPageUrl('Dashboard'));
                }}
                className="w-full bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] text-white"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF8A3D]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-[#FF8A3D]/10 text-[#FF8A3D] border-[#FF8A3D]/20 px-4 py-1">
                Remote-First Employee Engagement
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Where Teams
              <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] bg-clip-text text-transparent">
                {' '}
                Thrive Together
              </span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build culture, boost morale, and keep your remote team engaged with our all-in-one
              platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                onClick={() => {
                  console.log('[LANDING] Redirecting to login...');
                  base44.auth.redirectToLogin(createPageUrl('Dashboard'));
                }}
                className="bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] hover:from-[#FFB86C] hover:to-[#FF8A3D] text-white text-lg px-8 py-6 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 w-full sm:w-auto border-2 border-slate-300 hover:border-[#FF8A3D] hover:text-[#FF8A3D]"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF8A3D] to-[#FFB86C] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Engage
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed for remote-first teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 sm:p-8 hover:shadow-xl transition-shadow cursor-pointer group h-full">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Why Teams Love INTeract
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Transform your company culture and keep remote teams connected with measurable results.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square bg-gradient-to-br from-[#FF8A3D]/20 to-[#8B5CF6]/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <Award className="h-32 w-32 sm:h-48 sm:w-48 text-[#FF8A3D]/40" strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-[#0B0F19] via-[#14294D] to-[#1E2638] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF8A3D]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Culture?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join hundreds of companies building thriving remote teams
            </p>
            <Button
              size="lg"
              onClick={() => {
                console.log('[LANDING] Redirecting to login...');
                base44.auth.redirectToLogin(createPageUrl('Dashboard'));
              }}
              className="bg-white text-[#14294D] hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-white/20 transition-all"
            >
              Start Your Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-white/60 text-sm mt-4">No credit card required • 14-day trial</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-[#FF8A3D] to-[#FFB86C] rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">INTeract</span>
            </div>
            <p className="text-slate-400 text-sm text-center md:text-left">
              © 2026 INTeract. Powered by FlashFusion.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}