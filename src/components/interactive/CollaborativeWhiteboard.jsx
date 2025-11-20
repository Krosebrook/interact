import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eraser, Pencil, Download, Trash2, Users } from 'lucide-react';

export default function CollaborativeWhiteboard({ participantName, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="font-bold text-lg">Collaborative Whiteboard</h3>
          <Badge variant="outline">Drawing as {participantName}</Badge>
        </div>
        <Button onClick={saveDrawing} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition ${
                color === c ? 'border-slate-900 scale-110' : 'border-slate-300'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
          className="w-32"
        />
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border-2 border-slate-300 rounded-lg bg-white cursor-crosshair w-full"
        style={{ maxWidth: '100%', height: 'auto', aspectRatio: '8/5' }}
      />

      <p className="text-sm text-slate-600 mt-4">
        💡 Tip: Use this space to brainstorm ideas, sketch concepts, or collaborate visually with your team!
      </p>
    </Card>
  );
}