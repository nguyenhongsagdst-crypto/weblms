import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Lesson, Subject, Topic, ClassItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Clock,
  Video,
  FileText,
  School,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

export const LessonsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    subjectId: '',
    topicId: '',
    classIds: [] as string[],
    durationMinutes: 45,
    videoUrl: '',
    isPublished: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [less, subs, tops, clss] = await Promise.all([
        provider.getLessons(),
        provider.getSubjects(),
        provider.getTopics(),
        provider.getClasses(),
      ]);
      setLessons(less);
      setSubjects(subs);
      setTopics(tops);
      setClasses(clss);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải danh sách bài giảng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingLesson(null);
    const defaultSub = subjects[0]?.id || '';
    const defaultTop = topics.find((t) => t.subjectId === defaultSub)?.id || '';
    setFormData({
      title: '',
      summary: '',
      content: `## Mục tiêu bài học\n- Nắm vững kiến thức trọng tâm...\n\n### Nội dung chính\n1. Khái niệm cơ bản\n2. Các ví dụ áp dụng thực tế\n\n### Bài tập vận dụng\nHọc sinh hoàn thành bài tập đính kèm.`,
      subjectId: defaultSub,
      topicId: defaultTop,
      classIds: classes.map((c) => c.id), // default assign to all or select
      durationMinutes: 45,
      videoUrl: '',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content,
      subjectId: lesson.subjectId,
      topicId: lesson.topicId,
      classIds: lesson.classIds || [],
      durationMinutes: lesson.durationMinutes,
      videoUrl: lesson.videoUrl || '',
      isPublished: lesson.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId || !formData.topicId) {
      addToast('Vui lòng nhập tiêu đề, môn học và chủ đề', 'error');
      return;
    }

    try {
      if (editingLesson) {
        await provider.updateLesson(editingLesson.id, formData);
        addToast('Đã cập nhật bài giảng', 'success');
      } else {
        await provider.createLesson(formData);
        addToast('Đã tạo bài giảng mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu bài giảng', 'error');
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const nextStatus = !lesson.isPublished;
      await provider.updateLesson(lesson.id, { isPublished: nextStatus });
      addToast(
        nextStatus
          ? `Đã xuất bản bài giảng "${lesson.title}" cho học sinh`
          : `Đã chuyển bài giảng "${lesson.title}" về Bản nháp`,
        'info'
      );
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi đổi trạng thái bài giảng', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài giảng "${title}"?`)) {
      try {
        await provider.deleteLesson(id);
        addToast('Đã xóa bài giảng', 'info');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa bài giảng', 'error');
      }
    }
  };

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const topicMap = new Map(topics.map((t) => [t.id, t.title]));
  const classMap = new Map(classes.map((c) => [c.id, c.code]));

  // Filter lessons
  const filteredLessons = lessons.filter((les) => {
    const matchSearch =
      les.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      les.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = filterSubjectId === 'all' || les.subjectId === filterSubjectId;
    const matchClass =
      filterClassId === 'all' || (les.classIds && les.classIds.includes(filterClassId));
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' ? les.isPublished : !les.isPublished);
    return matchSearch && matchSub && matchClass && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Bài giảng (Lessons CRUD)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo nội dung bài học, nhúng video, gán cho các lớp và quản lý trạng thái xuất bản (Publish).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài giảng</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bài học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Subject */}
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

          {/* Filter Class */}
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.code}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản (Publish)</option>
            <option value="draft">Bản nháp (Draft)</option>
          </select>
        </div>
      </div>

      {/* Lessons List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải danh sách bài học...</div>
      ) : filteredLessons.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Không tìm thấy bài giảng nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((les) => (
            <div
              key={les.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                les.isPublished ? 'border-slate-200/80 hover:border-indigo-300' : 'border-amber-200/80 bg-amber-50/20'
              }`}
            >
              <div>
                {/* Status & Subject header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {subjectMap.get(les.subjectId) || 'Môn học'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(les)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                      les.isPublished
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                    title="Bấm để đổi trạng thái"
                  >
                    {les.isPublished ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Đã xuất bản</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Bản nháp</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 mt-3 leading-snug line-clamp-2">
                  {les.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {les.summary}
                </p>

                {/* Metadata */}
                <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Chủ đề:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">
                      {topicMap.get(les.topicId) || 'Chủ đề'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thời lượng:</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{les.durationMinutes} phút</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lớp phân công:</span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold font-mono">
                      {les.classIds && les.classIds.length > 0
                        ? les.classIds.map((c) => classMap.get(c)).filter(Boolean).join(', ')
                        : 'Toàn bộ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewLesson(les)}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(les)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(les.id, les.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa bài"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Lesson */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? 'Chỉnh sửa Bài giảng' : 'Tạo Bài giảng Mới'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề bài giảng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Bài 1: Cấu trúc HTML5 Ngữ nghĩa & Semantic Tags"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
                Chủ đề trực thuộc <span className="text-rose-500">*</span>
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Phân công cho các lớp
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              {classes.map((cls) => {
                const checked = formData.classIds.includes(cls.id);
                return (
                  <label
                    key={cls.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                      checked
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => {
                        const updated = checked
                          ? formData.classIds.filter((id) => id !== cls.id)
                          : [...formData.classIds, cls.id];
                        setFormData({ ...formData, classIds: updated });
                      }}
                    />
                    <span>{cls.code}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời lượng học (phút)
              </label>
              <input
                type="number"
                min="5"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: parseInt(e.target.value) || 45,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Link Video bài giảng (YouTube Embed)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tóm tắt bài học (Summary)
            </label>
            <input
              type="text"
              placeholder="Khái quát 1-2 câu về nội dung bài học..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung bài giảng (Markdown / Rich text)
            </label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedCheck"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPublishedCheck" className="font-semibold text-slate-700">
              Xuất bản ngay cho học sinh xem (Published)
            </label>
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
              {editingLesson ? 'Lưu thay đổi' : 'Tạo bài giảng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Preview Lesson */}
      <Modal
        isOpen={Boolean(previewLesson)}
        onClose={() => setPreviewLesson(null)}
        title={previewLesson?.title || 'Xem trước bài giảng'}
        maxWidth="2xl"
      >
        {previewLesson && (
          <div className="space-y-4 text-xs">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <span>Môn: <strong>{subjectMap.get(previewLesson.subjectId)}</strong></span>
              <span>•</span>
              <span>Thời lượng: <strong>{previewLesson.durationMinutes} phút</strong></span>
              <span>•</span>
              <span>Trạng thái: <strong>{previewLesson.isPublished ? 'Đã xuất bản' : 'Bản nháp'}</strong></span>
            </div>

            {/* Video embed if present */}
            {previewLesson.videoUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-sm">
                <iframe
                  src={previewLesson.videoUrl}
                  title={previewLesson.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}

            {/* Content formatted */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white space-y-3 prose prose-slate max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
              {previewLesson.content}
            </div>

            {/* Attachments */}
            {previewLesson.attachments && previewLesson.attachments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-700">Tài liệu đính kèm:</p>
                <div className="flex flex-wrap gap-2">
                  {previewLesson.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{att.name}</span>
                      {att.size && <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewLesson(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
