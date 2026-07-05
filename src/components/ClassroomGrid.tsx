import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, ClassroomTheme, LayoutMode } from '../types';
import { StudentCard } from './StudentCard';

interface ClassroomGridProps {
  students: Student[];
  assignments: (string | null)[]; // Array of 25 studentIds
  fixedStudentIds: Set<string>;
  selectedIndex: number | null;
  swapTargetIndex: number | null;
  theme: ClassroomTheme;
  mode: LayoutMode;
  namesHidden: boolean;
  scale: number;
  showFixedIndicators: boolean;
  groups?: [string, string][];
  firstGroupingStudentId?: string | null;
  onSelectSeat: (index: number) => void;
  onToggleLock: (studentId: string) => void;
  onDoubleClickStudent?: (studentId: string) => void;
}

export const ClassroomGrid: React.FC<ClassroomGridProps> = ({
  students,
  assignments,
  fixedStudentIds,
  selectedIndex,
  swapTargetIndex,
  theme,
  mode,
  namesHidden,
  scale,
  showFixedIndicators,
  groups = [],
  firstGroupingStudentId = null,
  onSelectSeat,
  onToggleLock,
  onDoubleClickStudent,
}) => {
  const getStudentById = (id: string | null): Student | null => {
    if (!id) return null;
    return students.find((s) => s.id === id) || null;
  };

  // Helper to render student card for a given absolute assignment index (0-24)
  const renderCard = (index: number) => {
    if (index >= assignments.length) return null;
    const studentId = assignments[index];
    const student = getStudentById(studentId);
    const isLocked = student ? fixedStudentIds.has(student.id) : false;

    const isGrouped = student ? groups.some(g => g.includes(student.id)) : false;
    const isGroupingFirstSelected = student ? firstGroupingStudentId === student.id : false;

    return (
      <StudentCard
        key={index}
        student={student}
        seatId={`seat-${index}`}
        seatIndex={index}
        theme={theme}
        isLocked={isLocked}
        showFixedIndicators={showFixedIndicators}
        isSelected={selectedIndex === index}
        isSwapTarget={swapTargetIndex === index}
        namesHidden={namesHidden}
        scale={scale}
        isGrouped={isGrouped}
        isGroupingFirstSelected={isGroupingFirstSelected}
        onToggleLock={() => {
          if (student) onToggleLock(student.id);
        }}
        onSelect={() => onSelectSeat(index)}
        onDoubleClick={() => {
          if (student && onDoubleClickStudent) {
            onDoubleClickStudent(student.id);
          } else if (student) {
            onToggleLock(student.id);
          }
        }}
      />
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start py-4 px-2 overflow-auto transition-all duration-300">
      <div 
        className="transition-all duration-500 w-full flex flex-col items-center"
        style={{ 
          zoom: scale,
          width: '100%',
        }}
      >
        <AnimatePresence mode="wait">
          {mode === 'individual' ? (
            /* ==================== 5x5 INDIVIDUAL GRID ==================== */
            <motion.div
              key="individual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-5 gap-x-8 gap-y-2 max-w-5xl mx-auto p-4 rounded-xl bg-slate-500/5 shadow-inner"
            >
              {Array.from({ length: 25 }).map((_, index) => (
                <div key={index} className="w-full aspect-video min-w-[120px] max-w-[180px] mx-auto">
                  {renderCard(index)}
                </div>
              ))}
            </motion.div>
          ) : (
            /* ==================== 3-GROUP COUPLE GRID ==================== */
            <motion.div
              key="pair"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row justify-center gap-6 lg:gap-12 max-w-6xl mx-auto p-4 rounded-xl bg-slate-500/5 shadow-inner"
            >
              {/* Left Group (0-7): 4 rows, 2 columns */}
              <div className="flex-1 flex flex-col items-center">
                <div className="grid grid-cols-2 gap-3 w-full max-w-[340px]">
                  {Array.from({ length: 8 }).map((_, rIndex) => (
                    <div key={rIndex} className="w-full aspect-video min-w-[120px]">
                      {renderCard(rIndex)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Group (8-16): 5 rows, 2 columns */}
              <div className="flex-1 flex flex-col items-center">
                <div className="grid grid-cols-2 gap-3 w-full max-w-[340px]">
                  {/* Rows 1-4 (8-15) */}
                  {Array.from({ length: 8 }).map((_, rIndex) => (
                    <div key={rIndex + 8} className="w-full aspect-video min-w-[120px]">
                      {renderCard(rIndex + 8)}
                    </div>
                  ))}
                  
                  {/* Row 5 (Left: empty space, Right: index 16) */}
                  <div className="invisible" />
                  <div className="w-full aspect-video min-w-[120px]">
                    {renderCard(16)}
                  </div>
                </div>
              </div>

              {/* Right Group (17-24): 4 rows, 2 columns */}
              <div className="flex-1 flex flex-col items-center">
                <div className="grid grid-cols-2 gap-3 w-full max-w-[340px]">
                  {Array.from({ length: 8 }).map((_, rIndex) => (
                    <div key={rIndex + 17} className="w-full aspect-video min-w-[120px]">
                      {renderCard(rIndex + 17)}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
