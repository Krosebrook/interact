import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionTimer() {
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSetup, setIsSetup] = useState(true);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (isSetup) {
      setTimeLeft(duration * 60);
      setIsSetup(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsSetup(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = duration > 0 ? ((timeLeft / (duration * 60)) * 100) : 0;

  const getColorClass = () => {
    if (percentage > 50) return 'text-emerald-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6" data-b44-sync="true" data-feature="facilitator" data-component="sessiontimer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Timer
        </h3>
        {!isSetup && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isSetup ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-2 block">
              Duration (minutes)
            </label>
            <Input
              type="number"
              min="1"
              max="180"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button
            onClick={handleStart}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Timer
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className={`text-6xl font-bold ${getColorClass()}`}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            <p className="text-sm text-slate-600 mt-2">
              {Math.floor(percentage)}% remaining
            </p>
          </div>

          {/* Progress Ring */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                className={`${getColorClass()} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {isRunning ? (
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
          </div>

          {timeLeft === 0 && (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">⏰ Time's up!</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}