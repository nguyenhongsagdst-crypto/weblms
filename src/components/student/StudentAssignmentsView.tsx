import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Assignment, Submission, Subject } from '../../types';
import { Modal } from '../common/Modal';
import {
  CalendarClock,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  UploadCloud,
  FileCheck2,
  Calendar,
} from 'lucide-react';

export const StudentAssignmentsView: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent, addToast, setStudentTab } = useApp();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'todo' | 'submitted' | 'past'>('todo');
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!currentStudent) return;
    try {
      setLoading(true);
      const [asgs, subs, subsList] = await Promise.all([
        provider.getAssignments({ status: 'published', classId: currentStudent.classId }),
        provider.getSubmissions({ studentId: currentStudent.id }),
        provider.getSubjects(),
      ]);

      setAssignments(asgs);
      setSubmissions(subs);
      setSubjects(subsList);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStudent, provider]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]));

  const now = new Date().getTime();

  // Categorize assignments
  const todoList: Assignment[] = [];
  const submittedList: Assignment[] = [];
  const pastDueList: Assignment[] = [];

  assignments.forEach((asg) => {
    const sub = submissionMap.get(asg.id);
    const isPast = new Date(asg.dueDate).getTime() < now;

    if (sub) {
      submittedList.push(asg);
    } else if (isPast) {
      pastDueList.push(asg);
    } else {
      todoList.push(asg);
    }
  });

  const handleOpenSubmitModal = (asg: Assignment) => {
    const existingSub = submissionMap.get(asg.id);
    setSubmittingAssignment(asg);
    setSubmitContent(existingSub ? existingSub.content : '');
    setAttachmentUrl(existingSub?.attachmentUrl || '');
  };

  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !currentStudent) return;
    if (!submitContent.trim() && !attachmentUrl.trim()) {
      addToast('Vui lòng nhập nội dung bài làm hoặc đính kèm link', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await provider.submitAssignment({
        assignmentId: submittingAssignment.id,
        studentId: currentStudent.id,
        content: submitContent,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });

      addToast(`Đã nộp bài tập "${submittingAssignment.title}" thành công!`, 'success');
      setSubmittingAssignment(null);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi gửi bài nộp', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedList =
    activeTab === 'todo'
      ? todoList
      : activeTab === 'submitted'
      ? submittedList
      : pastDueList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Nộp Bài tập Trực tuyến (Assignments)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Xem yêu cầu đề bài, nghiên cứu các tiêu chí Rubric và nộp bài làm trước thời hạn chót.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('todo')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'todo'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Cần nộp ({todoList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submitted')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'submitted'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã nộp ({submittedList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Quá hạn ({pastDueList.length})</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải bài tập...</div>
      ) : displayedList.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Không có bài tập nào trong mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map((asg) => {
            const sub = submissionMap.get(asg.id);
            const dueDateObj = new Date(asg.dueDate);
            const isPast = dueDateObj.getTime() < now;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {subjectMap.get(asg.subjectId) || 'Môn học'}
                    </span>

                    {sub ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          sub.status === 'graded'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.status === 'graded'
                          ? `Đã có điểm: ${sub.score}đ`
                          : 'Đã nộp bài'}
                      </span>
                    ) : isPast ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                        Quá hạn nộp
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                        Đang mở nhận bài
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3 leading-snug">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Rubric Preview snippet */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Tiêu chí Rubric ({asg.rubric?.length || 0})</span>
                      </span>
                      <span className="text-emerald-700 font-extrabold">
                        Thang {asg.maxPoints}đ
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      {asg.rubric?.slice(0, 2).map((cr) => (
                        <div key={cr.id} className="flex justify-between truncate">
                          <span className="truncate pr-2">• {cr.title}</span>
                          <span className="font-mono text-slate-700 font-semibold shrink-0">
                            {cr.maxPoints}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Hạn: {dueDateObj.toLocaleDateString('vi-VN')}{' '}
                      {dueDateObj.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub?.status === 'graded' ? (
                      <button
                        type="button"
                        onClick={() => setStudentTab('results')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                      >
                        Xem điểm Rubric
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSubmitModal(asg)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                          sub
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {sub ? 'Nộp lại bài' : 'Nộp bài ngay'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Submit Assignment */}
      <Modal
        isOpen={Boolean(submittingAssignment)}
        onClose={() => setSubmittingAssignment(null)}
        title={
          submissionMap.get(submittingAssignment?.id || '')
            ? `Cập nhật bài nộp: ${submittingAssignment?.title}`
            : `Nộp bài: ${submittingAssignment?.title}`
        }
        maxWidth="2xl"
      >
        {submittingAssignment && (
          <form onSubmit={handleSendSubmission} className="space-y-4 text-xs">
            {/* Assignment meta */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Môn: {subjectMap.get(submittingAssignment.subjectId)}
                </span>
                <span className="font-bold text-emerald-700">
                  Hạn chót: {new Date(submittingAssignment.dueDate).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{submittingAssignment.description}</p>
            </div>

            {/* Rubric View for student */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Tiêu chí Rubric giáo viên sẽ chấm điểm bài này:</span>
              </div>

              <div className="space-y-1.5">
                {submittingAssignment.rubric?.map((cr) => (
                  <div
                    key={cr.id}
                    className="p-2.5 rounded-lg bg-white border border-indigo-100/70 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{cr.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cr.description}</p>
                    </div>
                    <span className="font-mono font-bold text-indigo-700 text-xs shrink-0">
                      Tối đa {cr.maxPoints}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Field */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nội dung câu trả lời / Bài luận / Ghi chú <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Nhập nội dung bài làm, tóm tắt giải pháp hoặc các ghi chú dành cho thầy cô..."
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            {/* Attachment Field */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Đường dẫn liên kết tài liệu / Mã nguồn (GitHub, Google Docs, Drive, Vercel...)
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/project hoặc https://docs.google.com/..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang nộp...' : 'Xác nhận nộp bài'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
