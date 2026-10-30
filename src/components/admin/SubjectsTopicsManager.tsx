import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Subject, Topic, Lesson } from '../../types';
import { Modal } from '../common/Modal';
import {
  FolderTree,
  Plus,
  BookOpen,
  Code,
  Calculator,
  Atom,
  Globe,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const SubjectsTopicsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Topic Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order: 1,
    subjectId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subs, tops, less] = await Promise.all([
        provider.getSubjects(),
        provider.getTopics(),
        provider.getLessons(),
      ]);
      setSubjects(subs);
      setTopics(tops);
      setLessons(less);
      if (subs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải môn học và chủ đề', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeTopics = topics
    .filter((t) => t.subjectId === activeSubject?.id)
    .sort((a, b) => a.order - b.order);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return Code;
      case 'Calculator':
        return Calculator;
      case 'Atom':
        return Atom;
      case 'Globe':
        return Globe;
      default:
        return BookOpen;
    }
  };

  const handleOpenAddTopic = () => {
    if (!activeSubject) return;
    setEditingTopic(null);
    setTopicForm({
      title: '',
      description: '',
      order: activeTopics.length + 1,
      subjectId: activeSubject.id,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTopic = (t: Topic) => {
    setEditingTopic(t);
    setTopicForm({
      title: t.title,
      description: t.description || '',
      order: t.order,
      subjectId: t.subjectId,
    });
    setIsModalOpen(true);
  };

  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.title) {
      addToast('Vui lòng nhập tên chủ đề', 'error');
      return;
    }

    try {
      if (editingTopic) {
        await provider.updateTopic(editingTopic.id, topicForm);
        addToast('Đã cập nhật chủ đề', 'success');
      } else {
        await provider.createTopic(topicForm);
        addToast('Đã tạo chủ đề mới', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu chủ đề', 'error');
    }
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (window.confirm(`Xóa chủ đề "${title}"? Các bài học thuộc chủ đề sẽ cần được gán lại.`)) {
      try {
        await provider.deleteTopic(id);
        addToast('Đã xóa chủ đề', 'info');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa chủ đề', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Quản lý Môn học & Chủ đề (Subjects & Topics)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổ chức cây thư mục chương trình học theo môn, phân chia các chủ đề kiến thức logic.
        </p>
      </div>

      {/* Main Split: Left Subjects List, Right Topics Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Subjects Menu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh mục Môn học ({subjects.length})
            </h2>
          </div>

          <div className="space-y-2">
            {subjects.map((sub) => {
              const Icon = getSubjectIcon(sub.iconName);
              const isSelected = sub.id === activeSubject?.id;
              const subTopicsCount = topics.filter((t) => t.subjectId === sub.id).length;
              const subLessonsCount = lessons.filter((l) => l.subjectId === sub.id).length;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-tr ${sub.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sub.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {sub.code} · {subTopicsCount} chủ đề · {subLessonsCount} bài giảng
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Topics under Selected Subject */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {activeSubject && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {activeSubject.code}
                    </span>
                    <h2 className="font-extrabold text-base text-slate-900">
                      {activeSubject.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{activeSubject.description}</p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddTopic}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chủ đề</span>
                </button>
              </div>
            )}

            {/* Topics List */}
            <div className="mt-4 space-y-3">
              {activeTopics.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Môn học này chưa có chủ đề nào. Hãy bấm "Thêm chủ đề" để bắt đầu!
                </div>
              ) : (
                activeTopics.map((topic, index) => {
                  const topicLessons = lessons.filter((l) => l.topicId === topic.id);
                  return (
                    <div
                      key={topic.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                            {topic.order || index + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-xs text-slate-900 leading-snug">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                {topic.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                                <BookOpen className="w-3 h-3" />
                                <span>{topicLessons.length} bài giảng</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTopic(topic)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                            title="Sửa chủ đề"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(topic.id, topic.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                            title="Xóa chủ đề"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add/Edit Topic */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Chỉnh sửa Chủ đề' : `Thêm Chủ đề cho môn ${activeSubject?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitTopic} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              min="1"
              value={topicForm.order}
              onChange={(e) =>
                setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 1 })
              }
              className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên chủ đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chủ đề 1: HTML5 và Cấu trúc DOM"
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả tóm tắt nội dung
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú kiến thức trọng tâm của chủ đề này..."
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
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
              {editingTopic ? 'Cập nhật' : 'Tạo chủ đề'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
