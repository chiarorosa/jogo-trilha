import React from 'react';

interface GameStatusProps {
  message: string;
  isError?: boolean; // isError can still be used for text color if needed, but bg is primary
}

// Simple SVG Pawn Icon for the status bar
const StatusPawnIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
  </svg>
);


const GameStatus: React.FC<GameStatusProps> = ({ message, isError }) => {
  const textColor = isError ? 'text-red-300' : 'text-text-light'; // Error text red, normal text light on purple bg

  return (
    <div 
        className="fixed bottom-0 left-0 right-0 bg-primary text-text-light p-4 shadow-t-lg flex items-center justify-center z-10"
        role="status" // Changed from alert for general status
        aria-live="polite" 
      >
      <StatusPawnIcon />
      <span className={`text-base sm:text-lg font-semibold ${textColor}`}>{message}</span>
    </div>
  );
};

export default GameStatus;