import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number; // Duration in milliseconds
}

export default function Notification({
  message,
  type,
  onClose,
  duration = 5000, // Default duration 5 seconds
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Cleanup timer on component unmount or if onClose/duration changes
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const baseStyles = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-white text-sm z-50 transition-all duration-300 ease-in-out';
  const typeStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      {message}
      <button onClick={onClose} className="ml-4 text-lg font-bold hover:text-gray-200">&times;</button>
    </div>
  );
} 