import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Submission, Assignment, Student, ClassItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  Inbox,
  CheckCircle,
  Clock,
  ExternalLink,
  Award,
  MessageSquare,
  Search,
  Filter,
  User,
  Calendar,
  AlertCircle,
  Send,
} from 'lucide-react';

export const SubmissionsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterAssignmentId, setFilterAssignmentId] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [gradingStudent, setGradingStudent] = useState<Student | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [gradedBy, setGradedBy] = useState('ThS. Nguyễn Hoàng Nam');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subs, asgs, stus, clss] = await Promise.all([
        provider.getSubmissions(),
        provider.getAssignments(),
        provider.getStudents(),
        provider.getClasses(),
      ]);
      setSubmissions(subs);
      setAssignments(asgs);
      setStudents(stus);
      setClasses(clss);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải danh sách bài nộp', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const studentMap = new Map(students.map((s) => [s.id, s]));
  const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
  const classMap = new Map(classes.map((c) => [c.id, c.code]));

  const handleOpenGrading = (sub: Submission) => {
    const asg = assignmentMap.get(sub.assignmentId) || null;
    const stu = studentMap.get(sub.studentId) || null;

    setGradingSubmission(sub);
    setGradingAssignment(asg);
    setGradingStudent(stu);
    setFeedback(sub.feedback || '');

    // Initialize rubric scores from existing or defaults
    const initialRubric: Record<string, number> = {};
    asg?.rubric?.forEach((cr) => {
      initialRubric[cr.id] =
        sub.rubricScores?.[cr.id] !== undefined
          ? sub.rubricScores[cr.id]
          : cr.maxPoints * 0.8; // default suggestion
    });
    setRubricScores(initialRubric);
  };

  const handleRubricScoreChange = (criterionId: string, val: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [criterionId]: Math.max(0, val),
    }));
  };

  // Compute total score from rubric
  const totalScore = Object.values(rubricScores).reduce((acc, cur) => acc + (cur || 0), 0);

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await provider.gradeSubmission(gradingSubmission.id, {
        score: Number(totalScore.toFixed(1)),
        rubricScores,
        feedback: feedback.trim() || 'Bài làm tốt, đạt yêu cầu tiêu chí.',
        gradedBy,
      });

      addToast(
        `Đã chấm bài cho ${gradingStudent?.name || 'học sinh'}: ${totalScore.toFixed(1)} điểm`,
        'success'
      );
      setGradingSubmission(null);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu kết quả chấm bài', 'error');
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const stu = studentMap.get(s.studentId);
    const asg = assignmentMap.get(s.assignmentId);

    const matchSearch =
      (stu?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asg?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stu?.code || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchAsg = filterAssignmentId === 'all' || s.assignmentId === filterAssignmentId;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchSearch && matchAsg && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Quản lý Bài nộp & Chấm điểm theo Rubric (Submissions)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Xem bài làm của học sinh, chấm điểm chi tiết theo từng tiêu chí trong Rubric và gửi nhận xét phản hồi.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo học sinh, bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterAssignmentId}
            onChange={(e) => setFilterAssignmentId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white max-w-xs"
          >
            <option value="all">Tất cả bài tập</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="submitted">Chờ chấm điểm</option>
            <option value="graded">Đã chấm điểm</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Đang tải danh sách bài nộp...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Không có bài nộp nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Bài tập</th>
                  <th className="py-3 px-4">Thời gian nộp</th>
                  <th className="py-3 px-4">Đính kèm / Link</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const stu = studentMap.get(sub.studentId);
                  const asg = assignmentMap.get(sub.assignmentId);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={stu?.avatar}
                            alt={stu?.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{stu?.name || 'Học sinh'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {stu?.code} · Lớp {classMap.get(stu?.classId || '')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {asg?.title || 'Bài tập'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Thang điểm: {asg?.maxPoints}đ · {asg?.rubric?.length || 0} tiêu chí
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <div>{new Date(sub.submittedAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-slate-400">
                          {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {sub.attachmentUrl ? (
                          <a
                            href={sub.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-[11px] bg-indigo-50 px-2 py-1 rounded-md"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">Mở liên kết</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chỉ nộp văn bản</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'graded'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {sub.status === 'graded' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Đã chấm</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Chờ chấm</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {sub.status === 'graded' && sub.score !== undefined ? (
                          <span className="font-extrabold text-sm text-indigo-600">
                            {sub.score.toFixed(1)}đ
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenGrading(sub)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            sub.status === 'graded'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          {sub.status === 'graded' ? 'Chấm lại' : 'Chấm điểm'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Interactive Rubric Grading */}
      <Modal
        isOpen={Boolean(gradingSubmission)}
        onClose={() => setGradingSubmission(null)}
        title="Đánh giá & Chấm điểm theo Rubric"
        maxWidth="2xl"
      >
        {gradingSubmission && gradingAssignment && (
          <form onSubmit={handleSubmitGrade} className="space-y-4 text-xs">
            {/* Student & Assignment Meta */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={gradingStudent?.avatar}
                  alt={gradingStudent?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {gradingStudent?.name} ({gradingStudent?.code})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bài: <strong className="text-slate-700">{gradingAssignment.title}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-400 block">Tổng điểm Rubric</span>
                <span className="text-xl font-extrabold text-indigo-600">
                  {totalScore.toFixed(1)} / {gradingAssignment.maxPoints}đ
                </span>
              </div>
            </div>

            {/* Student Submission Content */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Nội dung bài làm của học sinh:
              </label>
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 font-sans leading-relaxed text-slate-800 whitespace-pre-wrap max-h-44 overflow-y-auto">
                {gradingSubmission.content || 'Học sinh không ghi chú văn bản.'}
              </div>

              {gradingSubmission.attachmentUrl && (
                <div className="pt-1">
                  <a
                    href={gradingSubmission.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200/60"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở link bài làm: {gradingSubmission.attachmentUrl}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Interactive Rubric Criteria */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Thang điểm theo từng Tiêu chí (Rubric Breakdown):</span>
              </label>

              <div className="space-y-2.5">
                {gradingAssignment.rubric?.map((cr) => {
                  const currentCriterionScore = rubricScores[cr.id] ?? 0;
                  return (
                    <div
                      key={cr.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{cr.title}</p>
                          <p className="text-[11px] text-slate-500">{cr.description}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={cr.maxPoints}
                            value={currentCriterionScore}
                            onChange={(e) =>
                              handleRubricScoreChange(
                                cr.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-slate-400 font-mono">/ {cr.maxPoints}đ</span>
                        </div>
                      </div>

                      {/* Slider helper for fast grading */}
                      <input
                        type="range"
                        min="0"
                        max={cr.maxPoints}
                        step="0.1"
                        value={currentCriterionScore}
                        onChange={(e) =>
                          handleRubricScoreChange(cr.id, parseFloat(e.target.value))
                        }
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Teacher Note */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Nhận xét và góp ý của giáo viên (Feedback):</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lời khen ngợi, điểm mạnh hoặc những lỗi cần khắc phục..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 font-medium">
                Giáo viên chấm: <span className="font-semibold text-slate-700">{gradedBy}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu điểm & Gửi nhận xét</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
