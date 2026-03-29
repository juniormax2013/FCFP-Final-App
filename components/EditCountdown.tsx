import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface EditCountdownProps {
  expiresAt: string;
  onExpire: () => void;
}

export const EditCountdown: React.FC<EditCountdownProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm font-medium mb-4">
      <Clock size={16} className="animate-pulse" />
      <span>Tiempo para editar: {mins}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
};
