import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Lesson, Subject, Topic, StudentLessonProgress } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Video,
  FileText,
  Search,
  ExternalLink,
  Award,
  Sparkles,
} from 'lucide-react';

export const StudentLessonsView: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent, addToast } = useApp();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressList, setProgressList] = useState<StudentLessonProgress[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!currentStudent) return;
    try {
      setLoading(true);
      const [less, subs, tops, progs] = await Promise.all([
        provider.getLessons({ isPublished: true, classId: currentStudent.classId }),
        provider.getSubjects(),
        provider.getTopics(),
        provider.getStudentProgress(currentStudent.id),
      ]);

      setLessons(less);
      setSubjects(subs);
      setTopics(tops);
      setProgressList(progs);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải bài học', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStudent, provider]);

  const progressMap = new Map(progressList.map((p) => [p.lessonId, p.isCompleted]));

  const handleToggleProgress = async (lessonId: string, title: string) => {
    if (!currentStudent) return;
    try {
      const updated = await provider.toggleLessonProgress(currentStudent.id, lessonId);
      addToast(
        updated.isCompleted
          ? `Tuyệt vời! Bạn đã hoàn thành bài học: "${title}"`
          : `Đã đánh dấu bài học "${title}" là chưa hoàn thành`,
        'success'
      );
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi cập nhật tiến độ học tập', 'error');
    }
  };

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const topicMap = new Map(topics.map((t) => [t.id, t.title]));

  const filteredLessons = lessons.filter((les) => {
    const matchSearch =
      les.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      les.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSub = selectedSubjectId === 'all' || les.subjectId === selectedSubjectId;
    return matchSearch && matchSub;
  });

  const completedCount = lessons.filter((l) => progressMap.get(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Overall Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bài học & Tiến độ Học tập (Lessons Progress)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Học lý thuyết, xem video giảng giải và chủ động đánh dấu hoàn thành từng bài học.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Tiến độ bài giảng</span>
              <span className="text-base font-extrabold text-emerald-600">
                {completedCount} / {lessons.length} bài ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
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
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">Môn học:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải bài học...</div>
      ) : filteredLessons.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Không tìm thấy bài giảng nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((les) => {
            const isCompleted = Boolean(progressMap.get(les.id));

            return (
              <div
                key={les.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'border-emerald-200/90 bg-emerald-50/15'
                    : 'border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {subjectMap.get(les.subjectId) || 'Môn học'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleProgress(les.id, les.title)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Bấm để đánh dấu hoàn thành"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã hoàn thành</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chưa học</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-3 leading-snug line-clamp-2">
                    {les.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {les.summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Chủ đề:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[180px]">
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
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveLesson(les)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Vào học ngay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Lesson Study View */}
      <Modal
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title || 'Bài học'}
        maxWidth="4xl"
      >
        {activeLesson && (
          <div className="space-y-5 text-xs">
            {/* Header meta & Toggle completion */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                  {subjectMap.get(activeLesson.subjectId)}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Thời lượng: <strong>{activeLesson.durationMinutes} phút</strong></span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleProgress(activeLesson.id, activeLesson.title)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  progressMap.get(activeLesson.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {progressMap.get(activeLesson.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã hoàn thành bài này</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-slate-400" />
                    <span>Đánh dấu đã hoàn thành</span>
                  </>
                )}
              </button>
            </div>

            {/* Video embed if present */}
            {activeLesson.videoUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md">
                <iframe
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}

            {/* Formatted Content */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white leading-relaxed text-slate-800 text-xs whitespace-pre-wrap font-sans space-y-3">
              {activeLesson.content}
            </div>

            {/* Attachments */}
            {activeLesson.attachments && activeLesson.attachments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800">Tài liệu học tập đính kèm:</p>
                <div className="flex flex-wrap gap-2">
                  {activeLesson.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{att.name}</span>
                      {att.size && <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Đóng bài học
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
