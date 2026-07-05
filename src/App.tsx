/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shuffle, 
  Eye, 
  EyeOff, 
  Printer, 
  Users, 
  RotateCcw, 
  Sliders, 
  BookOpen, 
  Save, 
  Trash2, 
  UserCheck,
  Camera,
  Menu,
  X,
  Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Student, ClassroomTheme, LayoutMode, SavedPlan } from './types';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import { CLASSROOM_THEMES } from './data/themes';
import { Chalkboard } from './components/Chalkboard';
import { ClassroomGrid } from './components/ClassroomGrid';
import { StudentListManager } from './components/StudentListManager';
import { classroomAudio } from './utils/audio';

export default function App() {
  // --- State Variables ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('CLASS_ROSTER');
    if (saved) {
      try {
        const roster = JSON.parse(saved);
        if (Array.isArray(roster)) {
          return roster.map(s => s.id === 'std-5' || s.name === '박주현' ? { ...s, name: '박주헌' } : s);
        }
      } catch (e) { /* fallback */ }
    }
    return DEFAULT_STUDENTS;
  });

  const [assignments, setAssignments] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem('CURRENT_ASSIGNMENTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* fallback */ }
    }
    // Default assignment mapping (direct order)
    const initial = Array.from({ length: 25 }, (_, idx) => DEFAULT_STUDENTS[idx]?.id || null);
    return initial;
  });

  const [fixedStudentIds, setFixedStudentIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('FIXED_STUDENTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      } catch (e) { /* fallback */ }
    }
    return new Set<string>();
  });

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const saved = localStorage.getItem('LAYOUT_MODE');
    return (saved as LayoutMode) || 'pair';
  });

  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('CLASSROOM_THEME') || 'chalkboard';
  });

  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('CLASSROOM_TITLE') || '2-11 자리배치 프로그램';
  });

  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('CLASSROOM_SCALE');
    return saved ? Math.min(1.25, parseFloat(saved)) : 1.0;
  });

  const [namesHidden, setNamesHidden] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFixedIndicators, setShowFixedIndicators] = useState<boolean>(true);

  // Toggle show/hide of fixed seat indicators by pressing '9'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '9') {
        setShowFixedIndicators((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // UI Panels
  const [showRosterManager, setShowRosterManager] = useState(false);

  // Saved Plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('CLASS_SAVED_PLANS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [newPlanName, setNewPlanName] = useState('');

  // --- Student Grouping & Menu states ---
  const [groups, setGroups] = useState<[string, string][]>(() => {
    const saved = localStorage.getItem('CLASSROOM_GROUPS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* fallback */ }
    }
    return [];
  });
  const [isGroupingMode, setIsGroupingMode] = useState<boolean>(false);
  const [firstGroupingStudentId, setFirstGroupingStudentId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const currentTheme = CLASSROOM_THEMES.find((t) => t.id === themeId) || CLASSROOM_THEMES[0];

  // --- Persistence & Sync Effects ---
  useEffect(() => {
    localStorage.setItem('CLASSROOM_GROUPS', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('CLASS_ROSTER', JSON.stringify(students));
    // Ensure assignments is aligned with current roster length
    const capacity = Math.max(25, students.length);
    setAssignments((prev) => {
      if (prev.length === capacity) return prev;
      const next = [...prev];
      if (next.length < capacity) {
        while (next.length < capacity) next.push(null);
      } else {
        next.slice(0, capacity);
      }
      return next;
    });
  }, [students]);

  useEffect(() => {
    localStorage.setItem('CURRENT_ASSIGNMENTS', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('FIXED_STUDENTS', JSON.stringify(Array.from(fixedStudentIds)));
  }, [fixedStudentIds]);

  useEffect(() => {
    localStorage.setItem('LAYOUT_MODE', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('CLASSROOM_THEME', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('CLASSROOM_TITLE', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('CLASSROOM_SCALE', scale.toString());
  }, [scale]);

  useEffect(() => {
    localStorage.setItem('CLASS_SAVED_PLANS', JSON.stringify(savedPlans));
  }, [savedPlans]);

  // --- Layout Helper functions ---

  // Handle card lock/unlock
  const handleToggleLock = (studentId: string) => {
    setFixedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Handle student double-click: ungroup if grouped, otherwise toggle lock
  const handleDoubleClickStudent = (studentId: string) => {
    const isGrouped = groups.some(g => g.includes(studentId));
    if (isGrouped) {
      setGroups(prev => prev.filter(g => !g.includes(studentId)));
      classroomAudio.playSuccess();
      alert('🔗 묶음(짝)이 해제되었습니다.');
      return;
    }
    handleToggleLock(studentId);
  };

  // Handle manual seat selection and swapping
  const handleSelectSeat = (index: number) => {
    if (isShuffling) return;

    const studentId = assignments[index];

    if (isGroupingMode) {
      if (!studentId) {
        alert('❌ 빈 자리는 묶을 수 없습니다. 학생을 선택해 주세요.');
        return;
      }

      // Check if student is already in a group
      const alreadyGrouped = groups.some(g => g.includes(studentId));
      if (alreadyGrouped) {
        alert('ℹ️ 이미 묶여 있는 학생입니다. 더블클릭하여 먼저 묶음을 해제하세요.');
        return;
      }

      if (firstGroupingStudentId === null) {
        setFirstGroupingStudentId(studentId);
        classroomAudio.playClick();
      } else {
        if (firstGroupingStudentId === studentId) {
          setFirstGroupingStudentId(null);
          classroomAudio.playClick();
        } else {
          // Join them in a pair
          setGroups(prev => [...prev, [firstGroupingStudentId, studentId]]);
          const name1 = students.find(s => s.id === firstGroupingStudentId)?.name || '학생1';
          const name2 = students.find(s => s.id === studentId)?.name || '학생2';
          
          alert(`💚 [${name1}]님과 [${name2}]님이 항상 같이 앉도록 묶였습니다!`);
          setFirstGroupingStudentId(null);
          classroomAudio.playSuccess();
        }
      }
      return;
    }

    if (selectedIndex === null) {
      // First card selected
      setSelectedIndex(index);
    } else {
      if (selectedIndex === index) {
        // Clicked same card - cancel selection
        setSelectedIndex(null);
      } else {
        // Second card selected - SWAP assignments!
        const nextAssignments = [...assignments];
        const temp = nextAssignments[selectedIndex];
        nextAssignments[selectedIndex] = nextAssignments[index];
        nextAssignments[index] = temp;

        setAssignments(nextAssignments);
        setSelectedIndex(null);
        classroomAudio.playSuccess();
      }
    }
  };

  // Main seat shuffling algorithm with realistic ticker countdown
  const handleShuffle = () => {
    if (isShuffling) return;
    
    // Capture original assignments at the start so we can guarantee accurate reconstruction
    const originalAssignments = [...assignments];

    // Check if there are un-locked students to shuffle
    const shufflableStudentIds: string[] = [];
    const shufflableSeatIndices: number[] = [];
    
    // We also want all occupied seats and all students in those seats to simulate a full shuffle animation
    const allAssignedSeatIndices: number[] = [];
    const allAssignedStudentIds: string[] = [];

    assignments.forEach((studentId, idx) => {
      if (studentId) {
        allAssignedSeatIndices.push(idx);
        allAssignedStudentIds.push(studentId);

        // If seat has a student and they are locked, do not touch for final!
        if (fixedStudentIds.has(studentId)) {
          return;
        }
        shufflableSeatIndices.push(idx);
        shufflableStudentIds.push(studentId);
      }
    });

    if (shufflableStudentIds.length <= 1) {
      alert('🔒 고정되지 않은 학생이 최소 2명 이상 있어야 자리를 섞을 수 있습니다!');
      return;
    }

    setIsShuffling(true);
    setSelectedIndex(null);

    let duration = 1800; // Total shuffle duration in ms
    let elapsed = 0;
    const intervalTime = 90;

    // Tick-tock simulation for rapid rolling shuffle effect (animating everyone!)
    const ticker = setInterval(() => {
      // Randomize ALL assigned students temporarily to make them look like they are shuffling
      const tempAllStudents = [...allAssignedStudentIds];
      for (let i = tempAllStudents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempAllStudents[i], tempAllStudents[j]] = [tempAllStudents[j], tempAllStudents[i]];
      }

      setAssignments((prev) => {
        const next = [...prev];
        allAssignedSeatIndices.forEach((seatIdx, arrIdx) => {
          next[seatIdx] = tempAllStudents[arrIdx] || null;
        });
        return next;
      });

      classroomAudio.playTick(220 + Math.random() * 200);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(ticker);
        
        // Final group-aware random assignment with secret constraint validation
        setAssignments(() => {
          let next = [...originalAssignments];
          const specA = 'std-1';
          const specB = 'std-18';
          const nameA = '엄남호';
          const nameB = '이진우';
          
          const pConfig = [
            [0, 1], [2, 3], [4, 5], [6, 7],
            [8, 9], [10, 11], [12, 13], [14, 15],
            [17, 18], [19, 20], [21, 22], [23, 24]
          ];

          const pairDefinitions = layoutMode === 'pair'
            ? pConfig
            : [
                [0, 1], [2, 3], [5, 6], [7, 8],
                [10, 11], [12, 13], [15, 16], [17, 18],
                [20, 21], [22, 23]
              ];

          // Filter groups to only those that are currently active (neither student is fixed/locked)
          const activeGroups = groups.filter(([sA, sB]) => {
            const existsA = students.some(s => s.id === sA);
            const existsB = students.some(s => s.id === sB);
            if (!existsA || !existsB) return false;
            return !fixedStudentIds.has(sA) && !fixedStudentIds.has(sB);
          });

          const hasOverlap = (arr: (string | null)[]) => {
            return pConfig.some(([a, b]) => {
              const id1 = arr[a];
              const id2 = arr[b];
              if (!id1 || !id2) return false;
              
              const student1 = students.find(s => s.id === id1);
              const student2 = students.find(s => s.id === id2);
              if (!student1 || !student2) return false;

              const isMatch1 = student1.id === specA || student1.name === nameA;
              const isMatch2 = student2.id === specB || student2.name === nameB;
              const isMatchRev1 = student1.id === specB || student1.name === nameB;
              const isMatchRev2 = student2.id === specA || student2.name === nameA;

              return (isMatch1 && isMatch2) || (isMatchRev1 && isMatchRev2);
            });
          };

          const generateRandomArrangement = () => {
            const nextArr = [...originalAssignments];
            
            // Clear all shufflable seat indices
            shufflableSeatIndices.forEach(idx => {
              nextArr[idx] = null;
            });

            const assignedStudents = new Set<string>();
            const filledSeats = new Set<number>();

            // Filter seat pairs that are completely free of fixed seats
            let availablePairs = pairDefinitions.filter(([sA, sB]) => {
              return shufflableSeatIndices.includes(sA) && shufflableSeatIndices.includes(sB);
            });

            // Shuffle available seat pairs
            availablePairs = [...availablePairs].sort(() => Math.random() - 0.5);

            // Shuffle active groups
            const shuffledGroups = [...activeGroups].sort(() => Math.random() - 0.5);

            // Assign groups to seat pairs
            shuffledGroups.forEach((group) => {
              const [studentA, studentB] = group;
              const pairIdx = availablePairs.findIndex(([sA, sB]) => !filledSeats.has(sA) && !filledSeats.has(sB));
              if (pairIdx !== -1) {
                const [seatA, seatB] = availablePairs[pairIdx];
                
                if (Math.random() > 0.5) {
                  nextArr[seatA] = studentA;
                  nextArr[seatB] = studentB;
                } else {
                  nextArr[seatA] = studentB;
                  nextArr[seatB] = studentA;
                }

                filledSeats.add(seatA);
                filledSeats.add(seatB);
                assignedStudents.add(studentA);
                assignedStudents.add(studentB);
              }
            });

            // Fill remaining unlocked seats with remaining unlocked students
            const remainingStudents = shufflableStudentIds.filter(id => !assignedStudents.has(id));
            const remainingSeats = shufflableSeatIndices.filter(idx => !filledSeats.has(idx));

            const shuffledRemainingStudents = [...remainingStudents].sort(() => Math.random() - 0.5);

            remainingSeats.forEach((seatIdx, arrIdx) => {
              nextArr[seatIdx] = shuffledRemainingStudents[arrIdx] || null;
            });

            return nextArr;
          };

          let attempts = 0;
          do {
            next = generateRandomArrangement();
            if (!hasOverlap(next)) {
              break;
            }
            attempts++;
          } while (attempts < 100);

          return next;
        });

        setIsShuffling(false);
        classroomAudio.playSuccess();
      }
    }, intervalTime);
  };

  // Save current arrangement plan
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    const planMap: { [seatId: string]: string | null } = {};
    assignments.forEach((studentId, idx) => {
      planMap[`seat-${idx}`] = studentId;
    });

    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      name: newPlanName.trim(),
      date: new Date().toLocaleDateString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      mode: layoutMode,
      assignments: planMap,
    };

    setSavedPlans([newPlan, ...savedPlans]);
    setNewPlanName('');
    classroomAudio.playSuccess();
  };

  // Load a saved plan
  const handleLoadPlan = (plan: SavedPlan) => {
    if (window.confirm(`'${plan.name}' 자리를 불러오시겠습니까? 현재 배치는 덮어씌워집니다.`)) {
      setLayoutMode(plan.mode);
      
      const nextAssignments = Array.from({ length: assignments.length }, (_, idx) => {
        return plan.assignments[`seat-${idx}`] !== undefined ? plan.assignments[`seat-${idx}`] : null;
      });
      setAssignments(nextAssignments);
      classroomAudio.playSuccess();
    }
  };

  // Delete a saved plan
  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 저장된 자리를 완전히 삭제하시겠습니까?')) {
      setSavedPlans(savedPlans.filter((p) => p.id !== id));
      classroomAudio.playClick();
    }
  };

  // Auto-fill/Reset current seating directly based on student list order
  const handleResetSeating = () => {
    if (window.confirm('현재 배치를 초기 학생명단 순서대로 복원하시겠습니까?')) {
      const next = Array.from({ length: assignments.length }, (_, idx) => students[idx]?.id || null);
      setAssignments(next);
      setFixedStudentIds(new Set());
      setSelectedIndex(null);
      classroomAudio.playSuccess();
    }
  };

  // Smart Print layout trigger
  const handlePrint = () => {
    classroomAudio.playClick();
    window.print();
  };

  // Capture current arrangement plan as a direct PNG download
  const handleCapture = async () => {
    const captureElement = document.getElementById('seating-chart');
    if (!captureElement) return;

    classroomAudio.playClick();

    // Helper to convert oklch and oklab to rgb in a CSS string or style declaration
    const convertCssStringColors = (cssText: string): string => {
      if (!cssText || typeof cssText !== 'string' || (!cssText.includes('oklch') && !cssText.includes('oklab'))) return cssText;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return cssText;

      const colorRegex = /(oklch|oklab)\([^)]+\)/g;
      return cssText.replace(colorRegex, (match) => {
        try {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = match;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        } catch (e) {
          return match;
        }
      });
    };

    try {
      // Fetch and pre-convert all styles on the active page to bypass html2canvas's unsupported 'oklch/oklab' color parser bug
      const convertedStylesheets: string[] = [];
      
      // 1. Process all existing <style> tags
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(style => {
        try {
          const converted = convertCssStringColors(style.textContent || '');
          convertedStylesheets.push(converted);
        } catch (e) {
          console.error('Style tag convert error:', e);
        }
      });

      // 2. Process all relative/same-origin <link rel="stylesheet"> tags
      const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
      for (let i = 0; i < linkTags.length; i++) {
        const link = linkTags[i] as HTMLLinkElement;
        if (link.href) {
          try {
            const url = new URL(link.href, window.location.href);
            if (url.origin === window.location.origin) {
              const res = await fetch(link.href);
              if (res.ok) {
                const cssText = await res.text();
                const converted = convertCssStringColors(cssText);
                convertedStylesheets.push(converted);
              }
            }
          } catch (e) {
            console.error('Link tag fetch/convert error:', e);
          }
        }
      }

      // Use html2canvas from the window global namespace loaded via CDN
      const html2canvasFn = (window as any).html2canvas;
      if (!html2canvasFn) {
        throw new Error('html2canvas library is not loaded from CDN.');
      }
      
      const canvas = await html2canvasFn(captureElement, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#fdf8f2', // matches default chalkboard theme warm sand background
        scale: 2, // high resolution 2x
        logging: false,
        onclone: (clonedDoc: any) => {
          // Remove all existing stylesheets in the cloned document so html2canvas doesn't parse raw 'oklch' or 'oklab' color functions
          const originalStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          originalStyles.forEach((el: any) => el.remove());

          // Append our safe pre-converted style definitions where all oklch/oklab are now rgb/rgba
          convertedStylesheets.forEach(cssText => {
            const styleEl = clonedDoc.createElement('style');
            styleEl.textContent = cssText;
            clonedDoc.head.appendChild(styleEl);
          });
        },
      });

      // Export using Data URL as requested
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'seating_chart.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert('💾 배치도 이미지 파일(seating_chart.png)이 고화질로 다운로드되었습니다!');
      classroomAudio.playSuccess();
    } catch (error) {
      console.error('Capture error:', error);
      alert('❌ 화면을 캡처하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 font-sans ${currentTheme.bg}`}>

      {/* Floating Hamburger Menu Trigger */}
      <div className="no-print fixed top-6 right-6 z-40">
        <button
          onClick={() => {
            classroomAudio.playClick();
            setShowMenu(!showMenu);
          }}
          className={`p-3.5 rounded-full shadow-lg border hover:shadow-xl transition-all cursor-pointer flex items-center justify-center ${
            isGroupingMode 
              ? 'bg-lime-500 hover:bg-lime-400 text-white border-lime-400 animate-pulse' 
              : 'bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-slate-800/50'
          }`}
          title="설정 메뉴 열기"
        >
          {showMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ==================== HAMBURGER SLIDE-OVER MENU ==================== */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="no-print fixed inset-0 bg-black z-40"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="no-print fixed top-0 right-0 h-screen w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto z-50 text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sliders size={20} className="text-emerald-600" />
                  설정 메뉴
                </h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                
                {/* Section 1: 묶기 (Grouping) 기능 */}
                <div className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-lime-800 dark:text-lime-300 flex items-center gap-1.5">
                      <Link size={16} />
                      짝지어 묶기 기능
                    </span>
                    <button
                      onClick={() => {
                        classroomAudio.playClick();
                        setIsGroupingMode(!isGroupingMode);
                        if (isGroupingMode) {
                          setFirstGroupingStudentId(null);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        isGroupingMode
                          ? 'bg-lime-500 text-white shadow-md'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {isGroupingMode ? '켜짐' : '꺼짐'}
                    </button>
                  </div>
                </div>

                {/* Section 2: 현재 묶여진 명단 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    현재 묶여진 짝꿍 목록 ({groups.length})
                  </h3>
                  
                  {groups.length === 0 ? (
                    <div className="text-xs text-slate-400 italic bg-slate-500/5 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                      현재 묶인 학생이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {groups.map(([idA, idB], idx) => {
                        const nameA = students.find(s => s.id === idA)?.name || '알수없음';
                        const nameB = students.find(s => s.id === idB)?.name || '알수없음';
                        return (
                          <div key={idx} className="flex items-center justify-between bg-lime-50 dark:bg-lime-950/20 px-3 py-2 rounded-xl border border-lime-500/20 text-xs">
                            <span className="font-medium text-lime-900 dark:text-lime-300 flex items-center gap-1">
                              {nameA} <Link size={11} className="opacity-50" /> {nameB}
                            </span>
                            <button
                              onClick={() => {
                                classroomAudio.playClick();
                                setGroups(prev => prev.filter((_, gIdx) => gIdx !== idx));
                              }}
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                              title="묶음 해제"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>



              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== MAIN VIEW AREA (Classroom Stage) ==================== */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-auto relative w-full max-w-7xl mx-auto z-10">

        {/* ==================== HORIZONTAL CONTROL BAR (Minimal Tools) ==================== */}
        <div className="no-print bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 w-full max-w-5xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-6 md:gap-8">
          
          {/* Left: Shuffle Button & Mode Toggle */}
          <div className="flex items-center flex-wrap gap-4">
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl shadow-md hover:shadow-emerald-500/10 font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
            >
              <Shuffle size={16} className={isShuffling ? 'animate-spin' : ''} />
              {isShuffling ? '자리 섞는 중...' : '자리 섞기'}
            </button>

            {/* Layout Mode Selection */}
            <div className="flex bg-slate-500/10 p-1 rounded-xl border border-slate-500/10">
              <button
                onClick={() => {
                  classroomAudio.playClick();
                  setLayoutMode('pair');
                }}
                className={`py-1.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'pair'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users size={13} />
                짝 모드
              </button>
              <button
                onClick={() => {
                  classroomAudio.playClick();
                  setLayoutMode('individual');
                }}
                className={`py-1.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'individual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck size={13} />
                개인 모드
              </button>
            </div>
          </div>

          {/* Middle: Zoom Scale slider */}
          <div className="flex items-center gap-3 bg-slate-500/5 px-4 py-2 rounded-xl border border-slate-500/10 min-w-[250px] max-w-xs">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
              <Sliders size={13} /> 크기 조절
            </span>
            <input
              type="range"
              min="0.7"
              max="1.25"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-emerald-600 whitespace-nowrap">{Math.round(scale * 100)}%</span>
          </div>

          {/* Right: Camera Capture Button */}
          <div className="flex items-center">
            <button
              onClick={handleCapture}
              className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md hover:shadow-blue-500/10 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              title="배치도를 이미지 파일로 다운로드 받기"
            >
              <Camera size={16} />
              이미지 다운로드
            </button>
          </div>

        </div>



        {/* Capturable Stage (Chalkboard + Grid) */}
        <div 
          id="seating-chart" 
          className="w-full flex flex-col items-center p-4 md:p-6 rounded-3xl transition-all duration-300 relative z-0"
        >
          {/* Header (Title + Blackboard) */}
          <header className="w-full animate-fade-in">
            <Chalkboard 
              theme={currentTheme} 
              title={title} 
              onTitleChange={setTitle} 
              scale={scale}
            />
          </header>

          {/* Classroom Interactive Grid */}
          <ClassroomGrid
            students={students}
            assignments={assignments}
            fixedStudentIds={fixedStudentIds}
            selectedIndex={selectedIndex}
            swapTargetIndex={null}
            theme={currentTheme}
            mode={layoutMode}
            namesHidden={namesHidden}
            scale={scale}
            showFixedIndicators={showFixedIndicators}
            groups={groups}
            firstGroupingStudentId={firstGroupingStudentId}
            onSelectSeat={handleSelectSeat}
            onToggleLock={handleToggleLock}
            onDoubleClickStudent={handleDoubleClickStudent}
          />
        </div>

      </main>

      {/* ==================== ACTIVE MODALS & SIDE PANELS ==================== */}
      
      {/* 1. Student Roster slide-over panel */}
      {showRosterManager && (
        <StudentListManager
          students={students}
          onUpdateStudents={setStudents}
          onClose={() => setShowRosterManager(false)}
        />
      )}

    </div>
  );
}
