
import React from 'react';
import { INSTRUCTIONS_TITLE, INSTRUCTIONS_CONTENT } from '../constants';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{INSTRUCTIONS_TITLE}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Fechar instruções"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          {INSTRUCTIONS_CONTENT.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{item.title}</h3>
              <p className="text-gray-600 whitespace-pre-line">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 text-right">
           <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Entendi!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
