import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Submission, Assignment, Subject } from '../../types';
import { Modal } from '../common/Modal';
import {
  Award,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Eye,
  TrendingUp,
} from 'lucide-react';

export const StudentResultsView: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent } = useApp();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    sub: Submission;
    asg: Assignment;
  } | null>(null);

  useEffect(() => {
    if (!currentStudent) return;

    const loadResults = async () => {
      try {
        setLoading(true);
        const [subs, asgs, subsList] = await Promise.all([
          provider.getSubmissions({ studentId: currentStudent.id }),
          provider.getAssignments(),
          provider.getSubjects(),
        ]);

        // Filter only graded submissions
        setSubmissions(subs.filter((s) => s.status === 'graded'));
        setAssignments(asgs);
        setSubjects(subsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [currentStudent, provider]);

  if (!currentStudent) return null;

  const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  // Calculate GPA
  const totalScore = submissions.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const avgScore =
    submissions.length > 0 ? (totalScore / submissions.length).toFixed(1) : '8.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kết quả Đánh giá & Nhận xét (Results & Rubrics)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng tổng hợp điểm số chi tiết theo từng tiêu chí trong Rubric và lời nhận xét của giáo viên.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">
                Điểm trung bình
              </span>
              <span className="text-xl font-extrabold text-purple-900">
                {avgScore} / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graded List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải kết quả...</div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Chưa có bài tập nào được chấm điểm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => {
            const asg = assignmentMap.get(sub.assignmentId);
            if (!asg) return null;

            const score = sub.score ?? 0;
            const scoreColor =
              score >= 9.0
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : score >= 8.0
                ? 'text-blue-700 bg-blue-50 border-blue-200'
                : 'text-amber-700 bg-amber-50 border-amber-200';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded">
                      {subjectMap.get(asg.subjectId) || 'Môn học'}
                    </span>

                    <div
                      className={`px-3 py-1 rounded-xl border text-sm font-extrabold ${scoreColor}`}
                    >
                      {score.toFixed(1)} / {asg.maxPoints}đ
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3 leading-snug">
                    {asg.title}
                  </h3>

                  {/* Teacher Feedback Quote */}
                  {sub.feedback && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-relaxed flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span>"{sub.feedback}"</span>
                        {sub.gradedBy && (
                          <span className="block text-[10px] text-slate-400 not-italic font-semibold mt-1">
                            — {sub.gradedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rubric Breakdown preview */}
                  {sub.rubricScores && asg.rubric && (
                    <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-bold text-slate-700 block">Điểm chi tiết:</span>
                      {asg.rubric.slice(0, 3).map((cr) => {
                        const earned = sub.rubricScores?.[cr.id] ?? 0;
                        return (
                          <div key={cr.id} className="flex justify-between text-slate-600">
                            <span className="truncate pr-2">• {cr.title}</span>
                            <span className="font-mono font-bold text-slate-900 shrink-0">
                              {earned} / {cr.maxPoints}đ
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Đã chấm: {sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedSubmission({ sub, asg })}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem đầy đủ bảng điểm Rubric</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Full Rubric Breakdown */}
      <Modal
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title="Chi tiết Bảng điểm & Tiêu chuẩn Rubric"
        maxWidth="lg"
      >
        {selectedSubmission && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {selectedSubmission.asg.title}
                </h3>
                <p className="text-[11px] text-purple-900 mt-0.5">
                  Người chấm: <strong>{selectedSubmission.sub.gradedBy || 'Giáo viên'}</strong>
                </p>
              </div>
              <span className="text-2xl font-extrabold text-purple-800">
                {selectedSubmission.sub.score?.toFixed(1)} / {selectedSubmission.asg.maxPoints}đ
              </span>
            </div>

            {/* Teacher Feedback */}
            {selectedSubmission.sub.feedback && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Lời nhận xét & Hướng dẫn cải thiện:</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{selectedSubmission.sub.feedback}"
                </p>
              </div>
            )}

            {/* Rubric Breakdown List */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Chi tiết từng Tiêu chí trong Rubric:</span>
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedSubmission.asg.rubric?.map((cr) => {
                  const earned = selectedSubmission.sub.rubricScores?.[cr.id] ?? 0;
                  const ratio = cr.maxPoints > 0 ? earned / cr.maxPoints : 0;
                  const percent = Math.round(ratio * 100);

                  return (
                    <div key={cr.id} className="p-3 bg-white space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">{cr.title}</p>
                          <p className="text-[11px] text-slate-500">{cr.description}</p>
                        </div>
                        <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded text-xs shrink-0">
                          {earned} / {cr.maxPoints}đ
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
