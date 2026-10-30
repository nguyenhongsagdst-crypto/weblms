import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { ReportStats, Submission, Assignment } from '../../types';
import {
  Users,
  School,
  BookOpen,
  FileCheck2,
  Inbox,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Megaphone,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const provider = useDataProvider();
  const { setAdminTab } = useApp();

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [assignmentTitles, setAssignmentTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [rep, subs, asgs, stus] = await Promise.all([
          provider.getReports(),
          provider.getSubmissions({ status: 'submitted' }),
          provider.getAssignments({ status: 'published' }),
          provider.getStudents(),
        ]);

        setStats(rep);
        setPendingSubmissions(subs.slice(0, 5));

        // Map names
        const stuMap: Record<string, string> = {};
        stus.forEach((s) => (stuMap[s.id] = s.name));
        setStudentNames(stuMap);

        const asgMap: Record<string, string> = {};
        asgs.forEach((a) => (asgMap[a.id] = a.title));
        setAssignmentTitles(asgMap);

        // Upcoming assignments due
        const now = new Date();
        const upcoming = asgs
          .filter((a) => new Date(a.dueDate) > now)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 4);
        setUpcomingAssignments(upcoming);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [provider]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-md shadow-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-indigo-50">
            Học kỳ I · Năm học 2025 - 2026
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2">
            Chào mừng Thầy/Cô trở lại EduCore LMS
          </h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Hệ thống đang quản lý {stats?.totalClasses} lớp học, {stats?.totalStudents} học sinh với tỷ lệ nộp bài đạt{' '}
            {stats?.submissionRate}% và điểm trung bình {stats?.averageScore}/10.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminTab('assignments')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Giao bài tập</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('lessons')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/50 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Thêm bài giảng</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Lớp học
            </span>
            <School className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalClasses}</p>
          <p className="text-[10px] text-slate-500 mt-1">Đang hoạt động</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Học sinh
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalStudents}</p>
          <p className="text-[10px] text-slate-500 mt-1">Tổng sĩ số</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bài giảng
            </span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalLessons}</p>
          <p className="text-[10px] text-slate-500 mt-1">Học phần trực tuyến</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bài tập
            </span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalAssignments}</p>
          <p className="text-[10px] text-slate-500 mt-1">Có rubric chấm điểm</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Chờ chấm
            </span>
            <Inbox className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">
            {pendingSubmissions.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Cần đánh giá rubric</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Điểm TB
            </span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600">
            {stats?.averageScore}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Toàn trường</p>
        </div>
      </div>

      {/* Main Grid: Pending Submissions & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Submissions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Bài nộp mới cần chấm điểm ({pendingSubmissions.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('submissions')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p>Tất cả bài nộp đã được chấm điểm hoàn tất!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {assignmentTitles[sub.assignmentId] || 'Bài tập'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-indigo-600">
                          {studentNames[sub.studentId] || 'Học sinh'}
                        </span>
                        <span>•</span>
                        <span>
                          Nộp lúc: {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')} ngày{' '}
                          {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAdminTab('submissions')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0 transition-colors"
                    >
                      Chấm điểm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tiêu chí Rubric hỗ trợ tính toán điểm tự động theo trọng số.</span>
            <button
              type="button"
              onClick={() => setAdminTab('gradebook')}
              className="font-medium text-slate-700 hover:text-indigo-600"
            >
              Mở Sổ điểm →
            </button>
          </div>
        </div>

        {/* Upcoming Deadlines (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Hạn chót sắp tới</h2>
            </div>
            <button
              type="button"
              onClick={() => setAdminTab('assignments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Quản lý
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Không có bài tập nào sắp đến hạn chót.
              </p>
            ) : (
              upcomingAssignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col gap-1"
                >
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {asg.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-amber-600 font-medium">
                      Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="font-mono text-slate-600">
                      {asg.rubric?.length || 0} tiêu chí rubric
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs flex items-start gap-2.5">
            <Megaphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Đồng bộ tự động</p>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Mọi thay đổi dữ liệu được lưu tức thời trên LocalStorage và phản ánh ngay lập tức vào sổ điểm của học sinh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
