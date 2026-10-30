import React, { useEffect, useState } from 'react';
import { useApp, AdminTab, StudentTab } from '../../context/AppContext';
import { useDataProvider } from '../../providers';
import {
  LayoutDashboard,
  School,
  Users,
  FolderTree,
  BookOpen,
  FileCheck2,
  Inbox,
  TableProperties,
  Bell,
  BarChart3,
  CheckCircle2,
  CalendarClock,
  Award,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role, adminTab, setAdminTab, studentTab, setStudentTab, currentStudent } =
    useApp();
  const provider = useDataProvider();

  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState<number>(0);
  const [todoAssignmentsCount, setTodoAssignmentsCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const subs = await provider.getSubmissions({ status: 'submitted' });
        setPendingSubmissionsCount(subs.length);

        if (currentStudent) {
          const asgs = await provider.getAssignments({ status: 'published' });
          const studentSubs = await provider.getSubmissions({
            studentId: currentStudent.id,
          });
          const submittedIds = new Set(studentSubs.map((s) => s.assignmentId));
          const todo = asgs.filter((a) => !submittedIds.has(a.id));
          setTodoAssignmentsCount(todo.length);
        }
      } catch (err) {
        console.error('Error fetching counter badges:', err);
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 5000);
    return () => clearInterval(interval);
  }, [currentStudent, provider]);

  const adminNavItems: {
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học (Classes)', icon: School },
    { id: 'students', label: 'Học sinh (Students)', icon: Users },
    { id: 'subjects', label: 'Môn & Chủ đề (Topics)', icon: FolderTree },
    { id: 'lessons', label: 'Bài giảng (Lessons)', icon: BookOpen },
    { id: 'questions', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
    { id: 'assignments', label: 'Bài tập & Rubric', icon: FileCheck2 },
    {
      id: 'submissions',
      label: 'Bài nộp & Chấm điểm',
      icon: Inbox,
      badge: pendingSubmissionsCount,
    },
    { id: 'gradebook', label: 'Sổ điểm (Gradebook)', icon: TableProperties },
    { id: 'announcements', label: 'Thông báo', icon: Bell },
    { id: 'reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { id: 'sheet-guide', label: 'Google Sheet & Script', icon: FileSpreadsheet },
  ];

  const studentNavItems: {
    id: StudentTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp của tôi', icon: School },
    { id: 'lessons', label: 'Bài học & Tiến độ', icon: BookOpen },
    {
      id: 'assignments',
      label: 'Bài tập cần nộp',
      icon: CalendarClock,
      badge: todoAssignmentsCount,
    },
    { id: 'results', label: 'Điểm & Nhận xét', icon: Award },
    { id: 'announcements', label: 'Bảng tin thông báo', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Context Header */}
      <div className="p-4 border-b border-slate-100">
        <div
          className={`px-3 py-2.5 rounded-xl border flex items-center justify-between ${
            role === 'admin'
              ? 'bg-indigo-50/60 border-indigo-200/60 text-indigo-950'
              : 'bg-emerald-50/60 border-emerald-200/60 text-emerald-950'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Không gian làm việc
            </span>
            <p className="font-bold text-sm">
              {role === 'admin' ? 'Khu vực Giáo viên' : 'Góc Học tập'}
            </p>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
            } animate-pulse`}
          />
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {role === 'admin' ? (
          <>
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quản trị & Giảng dạy
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAdminTab(item.id);
                    if (typeof window !== 'undefined') {
                      window.location.hash = `#/admin/${item.id}`;
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          <>
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Học tập cá nhân
            </p>
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = studentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStudentTab(item.id);
                    if (typeof window !== 'undefined') {
                      window.location.hash = `#/app/${item.id}`;
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-emerald-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Phiên bản:</span>
            <span className="font-mono text-slate-700 font-semibold">v1.2.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dữ liệu:</span>
            <span className="text-emerald-600 font-medium">Đồng bộ Local</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
