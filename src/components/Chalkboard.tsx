import React, { useState } from 'react';
import { Edit2, Check, Sparkles } from 'lucide-react';
import { ClassroomTheme } from '../types';
import { classroomAudio } from '../utils/audio';

interface ChalkboardProps {
  theme: ClassroomTheme;
  title: string;
  onTitleChange: (newTitle: string) => void;
  scale: number;
}

export const Chalkboard: React.FC<ChalkboardProps> = ({ theme, title, onTitleChange, scale }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditing(false);
    classroomAudio.playSuccess();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto mb-8 transition-all duration-500 ${theme.boardBorder}`}>
      <div className={`relative px-8 py-6 text-center ${theme.boardBg} flex flex-col justify-center items-center overflow-hidden min-h-[120px]`}>
        {/* Decorative Chalk Dust Texture / Glow */}
        {theme.id === 'chalkboard' && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/30 via-transparent to-transparent pointer-events-none opacity-40 mix-blend-overlay" />
        )}
        
        {isEditing ? (
          <div className="flex items-center gap-3 w-full max-w-2xl justify-center z-10">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-black/40 border-2 border-amber-500/50 rounded px-4 py-2 text-white font-jua tracking-wide text-center focus:outline-none focus:border-amber-400 w-full text-xl md:text-2xl"
              autoFocus
              maxLength={40}
            />
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white p-2.5 rounded hover:bg-emerald-500 transition-colors cursor-pointer"
              title="저장"
            >
              <Check size={20} />
            </button>
          </div>
        ) : (
          <div 
            className="group flex flex-col items-center gap-1 cursor-pointer select-none z-10 w-full"
            onClick={() => {
              classroomAudio.playClick();
              setIsEditing(true);
            }}
          >
            <div className="flex items-center justify-center gap-2 max-w-full">
              <h1 
                className={`font-jua tracking-wide transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${theme.boardText} break-words`}
                style={{ fontSize: `${1.7 * scale}rem` }}
              >
                {title}
              </h1>
              <Edit2 
                size={18} 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-200/60 hover:text-white"
              />
            </div>
          </div>
        )}

        {/* Realistic Wooden chalk shelf at the bottom for traditional board theme */}
        {theme.id === 'chalkboard' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-950/40 border-t border-amber-900/40" />
        )}
      </div>
    </div>
  );
};
