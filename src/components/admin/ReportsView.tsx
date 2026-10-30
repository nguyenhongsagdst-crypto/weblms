import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { ReportStats, ClassItem } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  School,
  Activity,
  FileCheck2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [rep, clss] = await Promise.all([
        provider.getReports(selectedClassId === 'all' ? undefined : selectedClassId),
        provider.getClasses(),
      ]);
      setStats(rep);
      setClasses(clss);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải dữ liệu báo cáo thống kê', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedClassId, provider]);

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p>Đang tính toán thống kê & phân tích phổ điểm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Báo cáo & Thống kê Đào tạo (Analytics & Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biểu đồ phân bố phổ điểm, tỷ lệ hoàn thành bài học và nhật ký hoạt động học tập thời gian thực.
          </p>
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-600">Phạm vi:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Toàn trường (Tất cả lớp)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tỷ lệ nộp bài
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{stats.submissionRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Đúng hạn và đầy đủ</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Điểm TB toàn khóa
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{stats.averageScore}/10</p>
          <p className="text-[10px] text-slate-500 mt-1">Thang điểm 10</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sĩ số học sinh
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalStudents}</p>
          <p className="text-[10px] text-slate-500 mt-1">Học sinh theo dõi</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bài tập đã giao
            </span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalAssignments}</p>
          <p className="text-[10px] text-slate-500 mt-1">Có rubric đánh giá</p>
        </div>
      </div>

      {/* Main Analysis: Score Distribution + Subject Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Phổ điểm Đánh giá (Score Distribution)</span>
            </h2>
          </div>

          <div className="space-y-3.5 mt-4">
            {stats.scoreDistribution.map((dist, idx) => {
              const barColors = [
                'bg-emerald-500',
                'bg-blue-500',
                'bg-indigo-500',
                'bg-amber-500',
                'bg-rose-500',
              ];
              const color = barColors[idx % barColors.length];

              return (
                <div key={dist.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dist.range}</span>
                    <span className="font-mono text-slate-500">
                      <strong>{dist.count} bài</strong> ({dist.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(dist.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Completion Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Tiến độ Hoàn thành theo Môn học</span>
            </h2>
          </div>

          <div className="space-y-3.5 mt-4">
            {stats.subjectProgress.map((sub) => (
              <div key={sub.subjectId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                  <span className="font-bold text-indigo-600 font-mono">
                    {sub.completionRate}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${sub.completionRate}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {sub.assignmentCount} bài tập chuyên đề
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Nhật ký Hoạt động Học tập Thời gian thực</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">10 hoạt động mới nhất</span>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {stats.recentActivity.map((act) => (
            <div
              key={act.id}
              className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'grade'
                      ? 'bg-purple-100 text-purple-700'
                      : act.type === 'submission'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {act.type === 'grade' ? (
                    <Award className="w-3.5 h-3.5" />
                  ) : act.type === 'submission' ? (
                    <FileCheck2 className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900">{act.studentName}</span>{' '}
                  <span className="text-slate-600">{act.title}</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(act.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                - {new Date(act.timestamp).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
