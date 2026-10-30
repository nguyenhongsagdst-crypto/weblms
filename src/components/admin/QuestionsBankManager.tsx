import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { QuestionItem, QuestionOption, Subject, Topic } from '../../types';
import { Modal } from '../common/Modal';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Award,
  Layers,
  BookOpen,
  ListOrdered,
  Sparkles,
  X,
} from 'lucide-react';

export const QuestionsBankManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [formData, setFormData] = useState<{
    subjectId: string;
    topicId: string;
    type: 'multiple_choice' | 'essay' | 'true_false';
    questionText: string;
    options: QuestionOption[];
    explanation: string;
    defaultPoints: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>({
    subjectId: '',
    topicId: '',
    type: 'multiple_choice',
    questionText: '',
    options: [],
    explanation: '',
    defaultPoints: 1.0,
    difficulty: 'medium',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qsts, subs, tops] = await Promise.all([
        provider.getQuestions(),
        provider.getSubjects(),
        provider.getTopics(),
      ]);
      setQuestions(qsts);
      setSubjects(subs);
      setTopics(tops);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải ngân hàng câu hỏi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    const defaultSub = subjects[0]?.id || '';
    const defaultTop = topics.find((t) => t.subjectId === defaultSub)?.id || '';

    setFormData({
      subjectId: defaultSub,
      topicId: defaultTop,
      type: 'multiple_choice',
      questionText: '',
      options: [
        { id: `opt-1`, text: '', isCorrect: true },
        { id: `opt-2`, text: '', isCorrect: false },
        { id: `opt-3`, text: '', isCorrect: false },
        { id: `opt-4`, text: '', isCorrect: false },
      ],
      explanation: '',
      defaultPoints: 1.0,
      difficulty: 'medium',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormData({
      subjectId: q.subjectId,
      topicId: q.topicId,
      type: q.type,
      questionText: q.questionText,
      options: q.options || [],
      explanation: q.explanation || '',
      defaultPoints: q.defaultPoints,
      difficulty: q.difficulty,
    });
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: `opt-${Date.now()}`,
          text: '',
          isCorrect: false,
        },
      ],
    }));
  };

  const handleRemoveOption = (optId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== optId),
    }));
  };

  const handleSetCorrectOption = (optId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o) => ({
        ...o,
        isCorrect: o.id === optId,
      })),
    }));
  };

  const handleOptionTextChange = (optId: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === optId ? { ...o, text } : o)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      addToast('Vui lòng nhập nội dung câu hỏi', 'error');
      return;
    }

    if (formData.type === 'multiple_choice' && formData.options.some((o) => !o.text.trim())) {
      addToast('Vui lòng nhập đầy đủ nội dung cho tất cả các đáp án', 'error');
      return;
    }

    try {
      if (editingQuestion) {
        await provider.updateQuestion(editingQuestion.id, formData);
        addToast('Đã cập nhật câu hỏi', 'success');
      } else {
        await provider.createQuestion(formData);
        addToast('Đã thêm câu hỏi vào ngân hàng', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu câu hỏi', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa câu hỏi này khỏi ngân hàng?')) {
      try {
        await provider.deleteQuestion(id);
        addToast('Đã xóa câu hỏi', 'info');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa câu hỏi', 'error');
      }
    }
  };

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const topicMap = new Map(topics.map((t) => [t.id, t.title]));

  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.explanation || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = filterSubjectId === 'all' || q.subjectId === filterSubjectId;
    const matchType = filterType === 'all' || q.type === filterType;
    const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchSub && matchType && matchDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Ngân hàng Câu hỏi (Question Bank)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kho đề thi, câu hỏi trắc nghiệm, đúng/sai và tự luận đồng bộ với tab "Quản lí ngân hàng câu hỏi" trên Google Sheets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo câu hỏi mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả dạng câu</option>
            <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
            <option value="true_false">Đúng / Sai</option>
            <option value="essay">Tự luận / Trả lời ngắn</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ (Nhận biết)</option>
            <option value="medium">Trung bình (Thông hiểu)</option>
            <option value="hard">Khó (Vận dụng cao)</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải câu hỏi...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Không tìm thấy câu hỏi nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => {
            const diffColor =
              q.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : q.difficulty === 'medium'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';

            const diffLabel =
              q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó';

            const typeLabel =
              q.type === 'multiple_choice'
                ? 'Trắc nghiệm'
                : q.type === 'true_false'
                ? 'Đúng / Sai'
                : 'Tự luận';

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {subjectMap.get(q.subjectId) || 'Môn học'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {topicMap.get(q.topicId) || 'Chủ đề'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {typeLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColor}`}>
                      {diffLabel}
                    </span>
                    <span className="font-extrabold text-xs text-indigo-600 font-mono">
                      {q.defaultPoints}đ
                    </span>

                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900 text-sm leading-snug">
                    <span className="text-slate-400 font-mono mr-1">#{index + 1}.</span> {q.questionText}
                  </p>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            opt.isCorrect
                              ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-semibold'
                              : 'border-slate-100 bg-slate-50/60 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt.text}</span>
                          </div>
                          {opt.isCorrect && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đáp án đúng</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                      <span className="font-bold text-slate-700">Lời giải thích:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Question */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới vào Ngân hàng'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Môn học <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => {
                  const newSubId = e.target.value;
                  const firstTop = topics.find((t) => t.subjectId === newSubId)?.id || '';
                  setFormData({ ...formData, subjectId: newSubId, topicId: firstTop });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chủ đề <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {topics
                  .filter((t) => t.subjectId === formData.subjectId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Loại câu hỏi <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  let newOptions = formData.options;
                  if (newType === 'true_false') {
                    newOptions = [
                      { id: 'opt-tf-1', text: 'Đúng', isCorrect: true },
                      { id: 'opt-tf-2', text: 'Sai', isCorrect: false },
                    ];
                  } else if (newType === 'essay') {
                    newOptions = [];
                  } else if (newOptions.length === 0) {
                    newOptions = [
                      { id: 'opt-1', text: '', isCorrect: true },
                      { id: 'opt-2', text: '', isCorrect: false },
                    ];
                  }
                  setFormData({ ...formData, type: newType, options: newOptions });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
                <option value="true_false">Đúng / Sai</option>
                <option value="essay">Tự luận / Tự nhập</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mức độ khó
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="easy">Dễ (Nhận biết)</option>
                <option value="medium">Trung bình (Thông hiểu)</option>
                <option value="hard">Khó (Vận dụng cao)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Điểm mặc định
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.defaultPoints}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPoints: parseFloat(e.target.value) || 1.0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Nhập đề bài hoặc câu hỏi..."
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
            />
          </div>

          {/* Options Builder for Multiple Choice or True/False */}
          {formData.type !== 'essay' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  Các lựa chọn đáp án (Bấm chọn radio để đặt đáp án đúng):
                </label>
                {formData.type === 'multiple_choice' && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    + Thêm phương án
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {formData.options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                      opt.isCorrect ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={opt.isCorrect}
                      onChange={() => handleSetCorrectOption(opt.id)}
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                      title="Chọn phương án này làm đáp án đúng"
                    />
                    <span className="font-bold text-slate-500 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Nội dung lựa chọn ${String.fromCharCode(65 + idx)}...`}
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs"
                    />
                    {formData.type === 'multiple_choice' && formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Xóa phương án"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lời giải thích / Hướng dẫn đáp án
            </label>
            <textarea
              rows={2}
              placeholder="Giải thích vì sao đáp án này đúng để học sinh tham khảo sau khi thi..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
            >
              {editingQuestion ? 'Lưu thay đổi' : 'Thêm vào ngân hàng'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
