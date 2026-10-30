import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProviderSettings } from '../../providers';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Database,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, setRole, currentStudent, setCurrentStudent, allStudents, addToast } =
    useApp();
  const { providerType, setProviderType, resetAllData } = useProviderSettings();
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu về trạng thái ban đầu (Seed Data)?')) {
      setIsResetting(true);
      await resetAllData();
      setIsResetting(false);
      addToast('Đã khôi phục dữ liệu mẫu thành công!', 'success');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  EduCore<span className="text-indigo-600">LMS</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Vite + React
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống Quản lý Học tập & Chấm điểm Rubric
              </p>
            </div>
          </div>

          {/* Center: Main Portal Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>/admin (Giáo viên)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('app')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'app'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>/app (Học sinh)</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Switcher when in /app mode */}
            {role === 'app' && currentStudent && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStudentMenu(!showStudentMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-xs font-medium text-emerald-900 transition-colors"
                  title="Chọn học sinh để trải nghiệm"
                >
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-300"
                  />
                  <div className="text-left hidden md:block">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {currentStudent.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-mono">
                      {currentStudent.code}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {showStudentMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Đổi vai trò học sinh để test
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {allStudents.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setCurrentStudent(st);
                            setShowStudentMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                            currentStudent.id === st.id
                              ? 'bg-emerald-50 text-emerald-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1 truncate">
                            <p className="font-medium text-slate-900 truncate">
                              {st.name}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {st.code} · GPA: {st.gpa}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Provider Contract Info button */}
            <button
              type="button"
              onClick={() => setShowProviderModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Xem kiến trúc DataProvider contract"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Provider:</span>
              <span className="font-mono text-indigo-600 font-semibold">
                {providerType === 'mock' ? 'mockProvider' : 'sheetProvider'}
              </span>
            </button>

            {/* Reset to Seed Data */}
            <button
              type="button"
              disabled={isResetting}
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-xs font-medium text-slate-600 transition-colors"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Cài lại Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Provider Contract Info Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Kiến trúc DataProvider Contract
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProviderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Hệ thống áp dụng chuẩn mẫu thiết kế <strong>Repository / DataProvider Interface</strong>{' '}
                (<code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded">DataProvider</code>).
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">1. MockProvider (Đang dùng)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    Kích hoạt
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ trên LocalStorage của trình duyệt, đi kèm SeedData phong phú (Lớp học, Học sinh, Bài tập có Rubric, Bài nộp và Điểm số).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">2. SheetProvider (Google Sheets)</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                    Đã cấu trúc sẵn
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  File mẫu <code className="text-slate-800">src/providers/sheetProvider.example.ts</code>{' '}
                  giữ nguyên contract 100%. Khi cần kết nối Google Sheets App Script, chỉ cần cấu hình endpoint mà không phải sửa bất kỳ dòng code UI nào!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
