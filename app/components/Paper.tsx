'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { usePapers } from '@/lib/hooks/use-papers';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Paper as PaperType } from '@/types/paper';

interface PaperProps {
  paper: PaperType;
  zoom: number;
}

export default function Paper({ paper, zoom }: PaperProps) {
  const [localText, setLocalText] = useState(paper.text);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: paper.x, y: paper.y });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const focusedPaperId = useStore((state) => state.focusedPaperId);
  const setFocusedPaperId = useStore((state) => state.setFocusedPaperId);

  const { updatePaper, deletePaper } = usePapers();

  const isFocused = focusedPaperId === paper.id;

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    setPosition({ x: paper.x, y: paper.y });
  }, [paper.x, paper.y]);

  // Debounced text update
  const debouncedUpdateText = useDebounce((text: string) => {
    if (text !== paper.text) {
      updatePaper(paper.id, { text }, paper.version);
    }
  }, 500);

  const handleBlur = () => {
    if (localText !== paper.text) {
      updatePaper(paper.id, { text: localText }, paper.version);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAuthenticated || isFocused) return;

    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x * zoom,
      y: e.clientY - position.y * zoom,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (position.x !== paper.x || position.y !== paper.y) {
        updatePaper(paper.id, { x: position.x, y: position.y }, paper.version);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, zoom, position, paper, updatePaper]);

  return (
    <div
      className={`absolute transition-all duration-200 ${
        isFocused ? 'z-50 scale-150' : isDragging ? 'z-40 cursor-grabbing' : 'z-10 cursor-grab'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isFocused ? 'rotate(0deg)' : `rotate(${paper.rotation}deg)`,
        zIndex: paper.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isFocused && !isDragging) {
          e.stopPropagation();
          setFocusedPaperId(paper.id);
        }
      }}
    >
      <div
        className={`shadow-lg border ${
          isFocused ? 'w-96 h-96' : 'w-48 h-48'
        } p-4 cursor-pointer relative`}
        style={{
          backgroundColor: paper.color,
          borderColor: paper.color,
          boxShadow: isFocused
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Pin */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow" />

        {isAuthenticated && isFocused ? (
          <>
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => {
                setLocalText(e.target.value);
                debouncedUpdateText(e.target.value);
              }}
              onBlur={handleBlur}
              className="w-full h-full bg-transparent resize-none outline-none font-handwriting text-gray-800"
              placeholder="Write something..."
              style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePaper(paper.id);
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
