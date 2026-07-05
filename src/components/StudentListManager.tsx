import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, HelpCircle, Check, Users } from 'lucide-react';
import { Student } from '../types';
import { DEFAULT_STUDENTS } from '../data/defaultStudents';
import { classroomAudio } from '../utils/audio';

interface StudentListManagerProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onClose: () => void;
}

export const StudentListManager: React.FC<StudentListManagerProps> = ({
  students,
  onUpdateStudents,
  onClose,
}) => {
  const [newName, setNewName] = useState('');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Generate neat unique ID
    const newId = `std-${Date.now()}`;
    const newStudent: Student = {
      id: newId,
      name: newName.trim(),
      isFixed: false,
    };

    onUpdateStudents([...students, newStudent]);
    setNewName('');
    classroomAudio.playSuccess();
  };

  const handleRemoveStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    onUpdateStudents(updated);
    classroomAudio.playClick();
  };

  const handleResetToDefault = () => {
    if (window.confirm('정말로 처음 2-11반 학생 명단(25명)으로 초기화하시겠습니까?')) {
      onUpdateStudents(DEFAULT_STUDENTS);
      classroomAudio.playSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 transition-all duration-300">
      <div className="bg-white text-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-emerald-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">학생 명단 관리 ({students.length}명)</h2>
          </div>
          <button
            onClick={() => {
              classroomAudio.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info Tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4 flex items-start gap-2">
          <HelpCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">학급 관리 안내</p>
            <p className="mt-0.5 text-amber-700/90 leading-relaxed">
              2-11반 기본 명단이 미리 준비되어 있습니다. 전입생 또는 전출생이 있다면 아래에서 추가하거나 삭제할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Add Student Form */}
        <form onSubmit={handleAddStudent} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-xs font-bold text-slate-500 mb-2">새 학생 추가</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="학생 이름 입력"
              className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
              maxLength={10}
            />

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-1.5 text-sm font-bold flex items-center gap-1 cursor-pointer transition-colors animate-fade-in"
            >
              <Plus size={16} /> 추가
            </button>
          </div>
        </form>

        {/* Student List Container */}
        <div className="flex-1 overflow-y-auto mb-4 border border-slate-200 rounded-lg pr-1">
          {students.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              등록된 학생이 없습니다.<br />새로운 학생을 등록해 주세요.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm truncate">{student.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(student.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 border-t pt-4">
          <button
            onClick={handleResetToDefault}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={14} /> 기본 2-11반 데이터로 초기화
          </button>
          
          <button
            onClick={() => {
              classroomAudio.playClick();
              onClose();
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg text-center cursor-pointer transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
