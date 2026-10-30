import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { ClassItem, Student, Assignment, Submission } from '../../types';
import {
  TableProperties,
  Download,
  School,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const GradebookView: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load classes initially
  useEffect(() => {
    const initClasses = async () => {
      try {
        const clss = await provider.getClasses();
        setClasses(clss);
        if (clss.length > 0) {
          setSelectedClassId(clss[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initClasses();
  }, [provider]);

  // Load gradebook whenever selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadGradebook = async () => {
      try {
        setLoading(true);
        const data = await provider.getGradebook(selectedClassId);
        setStudents(data.students);
        setAssignments(data.assignments);
        setSubmissions(data.submissions);
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi tải bảng điểm', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadGradebook();
  }, [selectedClassId, provider]);

  // Submission lookup map: "studentId_assignmentId" -> Submission
  const submissionMap = new Map<string, Submission>();
  submissions.forEach((s) => {
    submissionMap.set(`${s.studentId}_${s.assignmentId}`, s);
  });

  // Calculate average score for a student
  const getStudentAverage = (studentId: string): { avg: number | null; count: number } => {
    let total = 0;
    let gradedCount = 0;

    assignments.forEach((asg) => {
      const sub = submissionMap.get(`${studentId}_${asg.id}`);
      if (sub && sub.status === 'graded' && typeof sub.score === 'number') {
        total += sub.score;
        gradedCount++;
      }
    });

    return {
      avg: gradedCount > 0 ? Number((total / gradedCount).toFixed(1)) : null,
      count: gradedCount,
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = [
      'Mã Học Sinh',
      'Họ và Tên',
      ...assignments.map((a) => `"${a.title.replace(/"/g, '""')}"`),
      'Điểm Trung Bình',
    ];

    const rows = students.map((stu) => {
      const { avg } = getStudentAverage(stu.id);
      const studentScores = assignments.map((asg) => {
        const sub = submissionMap.get(`${stu.id}_${asg.id}`);
        if (sub?.status === 'graded') return sub.score ?? '';
        if (sub?.status === 'submitted') return 'Chờ chấm';
        return 'Chưa nộp';
      });

      return [
        `"${stu.code}"`,
        `"${stu.name}"`,
        ...studentScores,
        avg !== null ? avg : '',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `So_Diem_Lop_${selectedClass?.code || 'EduCore'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Đã xuất file bảng điểm CSV thành công!', 'success');
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Overall class average
  const allGradedScores = submissions
    .filter((s) => s.status === 'graded' && typeof s.score === 'number')
    .map((s) => s.score as number);

  const classAvg =
    allGradedScores.length > 0
      ? (allGradedScores.reduce((a, b) => a + b, 0) / allGradedScores.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sổ điểm Trực quan (Gradebook Matrix)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng ma trận tổng hợp điểm số từng học sinh theo từng bài tập, tự động tính điểm trung bình và xuất dữ liệu CSV.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar & Metrics */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-indigo-600" />
          <label className="text-xs font-bold text-slate-700">Chọn Lớp học:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>
        </div>

        {/* Quick class stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Sĩ số:</span>
            <strong className="text-slate-900 font-bold">{students.length} học sinh</strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Tổng bài tập:</span>
            <strong className="text-slate-900 font-bold">{assignments.length} bài</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-indigo-900">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Điểm TB lớp:</span>
            <strong className="font-extrabold text-indigo-700">{classAvg}/10</strong>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Đang tải bảng điểm...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Lớp này chưa có học sinh nào.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-700 uppercase tracking-wider text-[11px] sticky left-0 bg-slate-50 z-30 shadow-xs">
                    Học sinh
                  </th>
                  <th className="py-3 px-3 font-bold text-slate-700 uppercase tracking-wider text-[11px] text-center">
                    Mã HS
                  </th>

                  {/* Assignment Columns */}
                  {assignments.map((asg) => (
                    <th
                      key={asg.id}
                      className="py-3 px-3 font-bold text-slate-700 uppercase tracking-wider text-[11px] text-center min-w-[130px]"
                      title={asg.title}
                    >
                      <div className="truncate max-w-[140px] font-semibold text-slate-800">
                        {asg.title}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Thang {asg.maxPoints}đ)
                      </span>
                    </th>
                  ))}

                  <th className="py-3 px-4 font-extrabold text-indigo-700 uppercase tracking-wider text-[11px] text-center bg-indigo-50/60 sticky right-0 z-30 shadow-xs">
                    Trung Bình
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => {
                  const { avg, count } = getStudentAverage(stu.id);

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Fixed Student Name Column */}
                      <td className="py-3 px-4 sticky left-0 bg-white z-10 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-[180px]">
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900 truncate">
                            {stu.name}
                          </span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500 font-semibold text-[11px]">
                        {stu.code}
                      </td>

                      {/* Assignment Scores Cells */}
                      {assignments.map((asg) => {
                        const sub = submissionMap.get(`${stu.id}_${asg.id}`);

                        if (!sub) {
                          return (
                            <td key={asg.id} className="py-3 px-3 text-center">
                              <span className="text-[10px] text-slate-300 font-medium italic">
                                Chưa nộp
                              </span>
                            </td>
                          );
                        }

                        if (sub.status === 'submitted') {
                          return (
                            <td key={asg.id} className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Chờ chấm</span>
                              </span>
                            </td>
                          );
                        }

                        // Graded score
                        const score = sub.score ?? 0;
                        const scoreClass =
                          score >= 9.0
                            ? 'text-emerald-700 bg-emerald-50'
                            : score >= 8.0
                            ? 'text-blue-700 bg-blue-50'
                            : score >= 6.5
                            ? 'text-indigo-700 bg-indigo-50'
                            : 'text-amber-700 bg-amber-50';

                        return (
                          <td key={asg.id} className="py-3 px-3 text-center">
                            <span
                              className={`inline-block font-extrabold text-xs px-2.5 py-1 rounded-md font-mono ${scoreClass}`}
                              title={sub.feedback ? `Nhận xét: ${sub.feedback}` : 'Đã chấm'}
                            >
                              {score.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}

                      {/* Average Column */}
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-xs sticky right-0 bg-indigo-50/40 z-10 shadow-xs">
                        {avg !== null ? (
                          <span className="text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-[11px]">
                            Chưa có điểm
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
