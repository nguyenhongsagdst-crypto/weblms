import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Assignment, Submission, StudentLessonProgress, Announcement, ClassItem } from '../../types';
import {
  CalendarClock,
  BookOpen,
  Award,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  School,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent, setStudentTab } = useApp();

  const [todoAssignments, setTodoAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progressList, setProgressList] = useState<StudentLessonProgress[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentClass, setStudentClass] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStudent) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [asgs, subs, progs, anns, cls] = await Promise.all([
          provider.getAssignments({ status: 'published' }),
          provider.getSubmissions({ studentId: currentStudent.id }),
          provider.getStudentProgress(currentStudent.id),
          provider.getAnnouncements({ targetClassId: currentStudent.classId }),
          provider.getClassById(currentStudent.classId),
        ]);

        setSubmissions(subs);
        setProgressList(progs);
        setAnnouncements(anns.slice(0, 3));
        setStudentClass(cls);

        // Find assignments student hasn't submitted yet
        const submittedAssignmentIds = new Set(subs.map((s) => s.assignmentId));
        const todo = asgs
          .filter((a) => !submittedAssignmentIds.has(a.id))
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setTodoAssignments(todo);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentStudent, provider]);

  if (!currentStudent) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Vui lòng chọn học sinh từ thanh menu trên cùng để trải nghiệm giao diện học sinh.
      </div>
    );
  }

  const completedLessonsCount = progressList.filter((p) => p.isCompleted).length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded' && typeof s.score === 'number');
  const avgScore =
    gradedSubmissions.length > 0
      ? (
          gradedSubmissions.reduce((acc, c) => acc + (c.score || 0), 0) /
          gradedSubmissions.length
        ).toFixed(1)
      : (currentStudent.gpa || 8.5).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 p-6 text-white shadow-md shadow-emerald-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentStudent.avatar}
            alt={currentStudent.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                {studentClass ? studentClass.name : 'Lớp học sinh'}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-200">
                {currentStudent.code}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              Chào {currentStudent.name}!
            </h1>
            <p className="text-xs text-emerald-50 mt-0.5">
              Bạn có <strong>{todoAssignments.length} bài tập</strong> cần hoàn thành và đã hoàn thành{' '}
              <strong>{completedLessonsCount} bài giảng</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStudentTab('assignments')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 shadow-xs transition-colors self-start md:self-auto shrink-0"
        >
          <CalendarClock className="w-4 h-4 text-emerald-600" />
          <span>Làm bài tập ngay</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bài tập cần nộp
            </span>
            <CalendarClock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{todoAssignments.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Hạn chót đang đến gần</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bài học đã xong
            </span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{completedLessonsCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Đã đánh dấu hoàn thành</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Điểm TB Rubric
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{avgScore}/10</p>
          <p className="text-[10px] text-slate-500 mt-1">{gradedSubmissions.length} bài đã có điểm</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Thông báo mới
            </span>
            <Bell className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{announcements.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Từ nhà trường và lớp</p>
        </div>
      </div>

      {/* Main Grid: Urgent Deadlines & Latest Graded Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Assignments to Do (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Bài tập cần nộp sắp tới ({todoAssignments.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStudentTab('assignments')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todoAssignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p>Tuyệt vời! Bạn đã hoàn thành tất cả các bài tập được giao.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {todoAssignments.slice(0, 4).map((asg) => {
                  const dueDateObj = new Date(asg.dueDate);
                  const isDueSoon = dueDateObj.getTime() - Date.now() < 3 * 24 * 3600 * 1000;

                  return (
                    <div
                      key={asg.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {asg.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span
                            className={`font-semibold ${
                              isDueSoon ? 'text-amber-600' : 'text-slate-600'
                            }`}
                          >
                            Hạn chót: {dueDateObj.toLocaleDateString('vi-VN')}{' '}
                            {dueDateObj.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-indigo-600">
                            {asg.rubric?.length || 0} tiêu chí Rubric
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStudentTab('assignments')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                      >
                        Nộp bài
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Luôn kiểm tra kỹ Rubric trước khi bấm gửi bài làm.</span>
            <button
              type="button"
              onClick={() => setStudentTab('lessons')}
              className="font-medium text-emerald-600 hover:underline"
            >
              Học bài tiếp theo →
            </button>
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Bảng tin thông báo</h2>
            </div>
            <button
              type="button"
              onClick={() => setStudentTab('announcements')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Không có thông báo mới nào.
              </p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">
                      {ann.title}
                    </span>
                    {ann.isPinned && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold shrink-0">
                        Ghim
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(ann.createdAt).toLocaleDateString('vi-VN')} · {ann.authorName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
