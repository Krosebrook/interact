import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreakoutRooms({ participantName, participantEmail, allParticipants, onSubmit }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState({});

  // Assign participants to rooms (3-4 people per room)
  const createRooms = () => {
    const shuffled = [...allParticipants].sort(() => Math.random() - 0.5);
    const roomSize = Math.max(3, Math.ceil(shuffled.length / Math.ceil(shuffled.length / 4)));
    const rooms = [];
    
    for (let i = 0; i < shuffled.length; i += roomSize) {
      rooms.push({
        id: Math.floor(i / roomSize) + 1,
        name: `Room ${Math.floor(i / roomSize) + 1}`,
        participants: shuffled.slice(i, i + roomSize),
        topic: getRandomTopic()
      });
    }
    
    return rooms;
  };

  const getRandomTopic = () => {
    const topics = [
      'Share your biggest win this month',
      'What\'s one skill you\'d love to learn?',
      'Describe your dream vacation',
      'What motivates you at work?',
      'Share a fun fact about yourself',
      'What\'s your favorite productivity hack?'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };

  const rooms = createRooms();
  const myRoom = rooms.find(r => 
    r.participants.some(p => p.participant_email === participantEmail)
  );

  useEffect(() => {
    if (myRoom && !selectedRoom) {
      setSelectedRoom(myRoom);
    }
  }, [myRoom, selectedRoom]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    
    const newMessage = {
      id: Date.now(),
      sender: participantName,
      content: message,
      timestamp: new Date()
    };

    setRoomMessages(prev => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newMessage]
    }));
    
    setMessage('');
  };

  const handleSaveDiscussion = () => {
    const discussion = roomMessages[selectedRoom.id] || [];
    onSubmit({
      room: selectedRoom.name,
      topic: selectedRoom.topic,
      messages: discussion,
      summary: `Participated in ${selectedRoom.name} with ${selectedRoom.participants.length} people`
    });
  };

  if (!myRoom) {
    return (
      <Card className="p-6 text-center">
        <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Setting up breakout rooms...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-lg">Breakout Rooms</h3>
          <Badge className="bg-indigo-100 text-indigo-700">
            {myRoom.name}
          </Badge>
        </div>
        <Button onClick={handleSaveDiscussion} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          Save Discussion
        </Button>
      </div>

      <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">💬 Discussion Topic:</h4>
        <p className="text-purple-700">{myRoom.topic}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-sm text-slate-700 mb-2">Room Members:</h4>
        <div className="flex flex-wrap gap-2">
          {myRoom.participants.map((p, i) => (
            <Badge key={i} variant="outline">
              {p.participant_name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="border rounded-lg bg-slate-50 h-64 overflow-y-auto p-4 mb-4">
        <AnimatePresence>
          {(roomMessages[myRoom.id] || []).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.sender}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {(!roomMessages[myRoom.id] || roomMessages[myRoom.id].length === 0) && (
          <div className="text-center text-slate-500 mt-20">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Start the conversation! Share your thoughts on the topic above.</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          rows={2}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-slate-600 mt-3">
        💡 This is a simulated breakout room. In a real session, you'd be in a live video call with your room members!
      </p>
    </Card>
  );
}