import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Trophy, Timer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple reaction time game
export default function MultiplayerGame({ participantName, onComplete }) {
  const [gameMode, setGameMode] = useState('idle'); // idle, waiting, active, finished
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });

  const totalRounds = 5;

  const startGame = () => {
    setGameMode('waiting');
    setScore(0);
    setRound(0);
    setReactionTimes([]);
    nextRound();
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      finishGame();
      return;
    }

    setRound(prev => prev + 1);
    
    // Random delay before showing target
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setTargetPosition({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80
      });
      setGameMode('active');
      setStartTime(Date.now());
    }, delay);
  };

  const handleHit = () => {
    if (gameMode !== 'active') return;
    
    const reactionTime = Date.now() - startTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setScore(prev => prev + Math.max(1000 - reactionTime, 100));
    setGameMode('waiting');
    
    setTimeout(nextRound, 500);
  };

  const finishGame = () => {
    setGameMode('finished');
    const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    onComplete({
      game: 'Reaction Time Challenge',
      score,
      avg_reaction_ms: Math.round(avgReaction),
      rounds: totalRounds
    });
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-lg">Reaction Time Challenge</h3>
        </div>
        {gameMode !== 'idle' && (
          <div className="flex gap-4">
            <Badge variant="outline">
              <Timer className="h-3 w-3 mr-1" />
              Round {round}/{totalRounds}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              <Zap className="h-3 w-3 mr-1" />
              {score} pts
            </Badge>
          </div>
        )}
      </div>

      {gameMode === 'idle' && (
        <div className="text-center py-12">
          <Gamepad2 className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">Ready to Test Your Reflexes?</h4>
          <p className="text-slate-600 mb-6">
            Click the targets as fast as you can! Faster clicks = higher score.
          </p>
          <Button onClick={startGame} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Start Game
          </Button>
        </div>
      )}

      {(gameMode === 'waiting' || gameMode === 'active') && (
        <div 
          className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200"
          style={{ height: '400px' }}
        >
          {gameMode === 'waiting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-2xl font-bold text-indigo-600"
              >
                Get Ready...
              </motion.div>
            </div>
          )}

          {gameMode === 'active' && (
            <AnimatePresence>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={handleHit}
                className="absolute w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg hover:scale-110 transition flex items-center justify-center text-white font-bold"
                style={{
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                HIT!
              </motion.button>
            </AnimatePresence>
          )}
        </div>
      )}

      {gameMode === 'finished' && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-2xl font-bold text-slate-900 mb-2">Game Complete! 🎉</h4>
          <div className="space-y-2 mb-6">
            <p className="text-3xl font-bold text-indigo-600">{score} Points</p>
            <p className="text-slate-600">
              Average Reaction: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={startGame} variant="outline">
              Play Again
            </Button>
            <Button onClick={() => setGameMode('idle')} className="bg-emerald-600 hover:bg-emerald-700">
              Results Saved!
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-4">
        💡 Multiplayer mode coming soon - compete in real-time with your teammates!
      </p>
    </Card>
  );
}