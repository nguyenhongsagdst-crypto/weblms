import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { Bell, Pin, Calendar, User, School, Sparkles } from 'lucide-react';

export const StudentAnnouncementsView: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent } = useApp();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStudent) return;

    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await provider.getAnnouncements({
          targetClassId: currentStudent.classId,
        });
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [currentStudent, provider]);

  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Bảng tin Thông báo (Announcements)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Cập nhật thông tin chính thức từ Ban Giám Hiệu và các thông báo chuyên đề của lớp học.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải thông báo...</div>
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Hiện tại chưa có thông báo mới nào.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                ann.isPinned
                  ? 'border-indigo-200 bg-indigo-50/25 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      <Pin className="w-3 h-3" />
                      <span>Tin ghim quan trọng</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {ann.targetClassId ? 'Thông báo lớp' : 'Toàn trường'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Người gửi: <strong className="text-slate-800">{ann.authorName}</strong> (
                    {ann.authorRole})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
