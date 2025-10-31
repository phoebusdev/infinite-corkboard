'use client';

import { Paper as PaperType } from '@/types/paper';
import { useState, useRef, useEffect } from 'react';

interface PaperProps {
  paper: PaperType;
  isEditable: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

export default function Paper({
  paper,
  isEditable,
  isFocused,
  onFocus,
  onUpdate,
  onDelete,
}: PaperProps) {
  const [localText, setLocalText] = useState(paper.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  const handleBlur = () => {
    if (localText !== paper.text) {
      onUpdate(localText);
    }
  };

  return (
    <div
      className={`absolute transition-all duration-200 ${
        isFocused ? 'z-50 scale-150' : 'z-10'
      }`}
      style={{
        left: `${paper.x}px`,
        top: `${paper.y}px`,
        transform: isFocused ? 'rotate(0deg)' : `rotate(${paper.rotation}deg)`,
      }}
      onClick={(e) => {
        if (!isFocused) {
          e.stopPropagation();
          onFocus();
        }
      }}
    >
      <div
        className={`bg-yellow-100 shadow-lg border border-yellow-200 ${
          isFocused ? 'w-96 h-96' : 'w-48 h-48'
        } p-4 cursor-pointer relative`}
        style={{
          boxShadow: isFocused
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Pin at the top */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow" />

        {isEditable && isFocused ? (
          <>
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={handleBlur}
              className="w-full h-full bg-transparent resize-none outline-none font-handwriting text-gray-800"
              placeholder="Write something..."
              style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute bottom-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          </>
        ) : (
          <div
            className="w-full h-full overflow-hidden whitespace-pre-wrap break-words text-gray-800"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
          >
            {paper.text || '(empty)'}
          </div>
        )}
      </div>
    </div>
  );
}
