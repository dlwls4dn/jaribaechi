import React from 'react';
import { motion } from 'motion/react';
import { EyeOff, ArrowLeftRight, Link as LinkIcon } from 'lucide-react';
import { Student, ClassroomTheme } from '../types';
import { classroomAudio } from '../utils/audio';

interface StudentCardProps {
  student: Student | null;
  seatId: string;
  seatIndex: number;
  theme: ClassroomTheme;
  isLocked: boolean;
  showFixedIndicators: boolean;
  isSelected: boolean;
  isSwapTarget: boolean;
  namesHidden: boolean;
  scale: number;
  isGrouped?: boolean;
  isGroupingFirstSelected?: boolean;
  onToggleLock: () => void;
  onSelect: () => void;
  onDoubleClick?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  seatIndex,
  theme,
  isLocked,
  showFixedIndicators,
  isSelected,
  isSwapTarget,
  namesHidden,
  scale,
  isGrouped = false,
  isGroupingFirstSelected = false,
  onToggleLock,
  onSelect,
  onDoubleClick,
}) => {
  const isVacant = !student;
  const effectiveLocked = isLocked && showFixedIndicators;

  const handleCardClick = (e: React.MouseEvent) => {
    classroomAudio.playClick();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (student) {
      e.stopPropagation();
      classroomAudio.playClick();
      if (onDoubleClick) {
        onDoubleClick();
      } else {
        onToggleLock();
      }
    }
  };

  const dynamicStyle = {
    fontSize: `${1.1 * scale}rem`,
    padding: `${0.65 * scale}rem ${0.9 * scale}rem`,
    borderRadius: `${0.5 * scale}rem`,
    minHeight: `${4.5 * scale}rem`,
  };

  const iconSize = Math.max(14, Math.round(16 * scale));

  // Determine background and borders for the student card
  let cardBgClass = isVacant ? theme.emptyBg : effectiveLocked ? theme.fixedBg : theme.cardBg;
  let cardBorderClass = isVacant ? 'border-dashed border-2' : theme.cardBorder;
  let cardTextClass = effectiveLocked ? theme.fixedText : theme.cardText;

  if (!isVacant) {
    if (isGroupingFirstSelected) {
      cardBgClass = 'bg-lime-200 dark:bg-lime-900 ring-4 ring-lime-500 animate-pulse';
      cardBorderClass = 'border-lime-500 dark:border-lime-400';
      cardTextClass = 'text-lime-950 dark:text-lime-100';
    } else if (isGrouped) {
      cardBgClass = 'bg-lime-50 hover:bg-lime-100 dark:bg-lime-950/45 dark:hover:bg-lime-900/40 ring-1 ring-lime-400/50';
      cardBorderClass = 'border-lime-500/80 dark:border-lime-500';
      cardTextClass = 'text-lime-800 dark:text-lime-300';
    }
  }

  return (
    <motion.div
      layoutId={`card-${seatIndex}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      className={`
        relative flex flex-col justify-center items-center transition-all duration-300 cursor-pointer select-none border shadow-md
        ${isSelected ? theme.selectedBg : isSwapTarget ? 'ring-4 ring-yellow-400 scale-105' : effectiveLocked && !isGrouped ? 'ring-2 ring-amber-500' : ''}
        ${cardBgClass}
        ${cardBorderClass}
        ${theme.cardHover}
      `}
      style={dynamicStyle}
    >
      {/* Top right icon for grouped or locked status */}
      {!isVacant && (
        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-70">
          {isGrouped && (
            <LinkIcon size={iconSize * 0.75} className="text-lime-600 dark:text-lime-400 animate-pulse" />
          )}
        </div>
      )}

      {/* Main Student Name Area */}
      <div className="flex-1 flex flex-col justify-center items-center w-full my-1">
        {isVacant ? (
          <span className="text-slate-400 font-medium italic opacity-60" style={{ fontSize: `${0.9 * scale}rem` }}>
            공석
          </span>
        ) : namesHidden ? (
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 180 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-1 text-slate-400 font-mono"
            style={{ fontSize: `${1.1 * scale}rem` }}
          >
            <EyeOff size={iconSize * 1.1} className="animate-pulse" />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span 
              className={`font-bold tracking-wide transition-colors ${cardTextClass}`}
              style={{ fontSize: `${1.25 * scale}rem` }}
            >
              {student.name}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Bar Indicator (Manual swap instructions or state info) */}
      <div className="absolute bottom-1 w-full flex justify-center opacity-60">
        {isSelected && (
          <div className="text-[9px] text-amber-500 font-medium flex items-center gap-0.5 animate-bounce">
            <ArrowLeftRight size={8} /> 바꿀 자리 클릭
          </div>
        )}
      </div>
    </motion.div>
  );
};
