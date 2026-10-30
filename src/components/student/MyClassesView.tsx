import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { ClassItem, Student, Subject, Lesson } from '../../types';
import {
  School,
  Users,
  BookOpen,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';

export const MyClassesView: React.FC = () => {
  const provider = useDataProvider();
  const { currentStudent, setStudentTab } = useApp();

  const [studentClass, setStudentClass] = useState<ClassItem | null>(null);
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLessons, setClassLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStudent) return;

    const loadClassData = async () => {
      try {
        setLoading(true);
        const [cls, allStudents, subs, less] = await Promise.all([
          provider.getClassById(currentStudent.classId),
          provider.getStudents({ classId: currentStudent.classId }),
          provider.getSubjects(),
          provider.getLessons({ classId: currentStudent.classId, isPublished: true }),
        ]);

        setStudentClass(cls);
        setClassmates(allStudents);
        setSubjects(subs);
        setClassLessons(less);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [currentStudent, provider]);

  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Lớp học của tôi (My Classes)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Thông tin chi tiết lớp chủ nhiệm, giảng viên phụ trách và danh sách bạn học cùng lớp.
        </p>
      </div>

      {studentClass && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          {/* Class Title & Teacher Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-sm border border-emerald-200/60">
                  {studentClass.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {studentClass.gradeLevel} · Niên khóa {studentClass.academicYear}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {studentClass.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {studentClass.description || 'Chưa có mô tả chi tiết cho lớp học.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 shrink-0">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-emerald-600" />
                <span>GVCN: <strong>{studentClass.teacherName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Phòng: <strong>{studentClass.room || 'Chưa gán'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Sĩ số: <strong>{classmates.length} học sinh</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Syllabus Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Các học phần & Bài giảng đang mở ({classLessons.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setStudentTab('lessons')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Vào xem bài học →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classLessons.slice(0, 6).map((les) => (
                <div
                  key={les.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 transition-all flex flex-col justify-between"
                >
                  <p className="font-bold text-xs text-slate-900 truncate">{les.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{les.summary}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Thời lượng: {les.durationMinutes} phút</span>
                    <span className="text-emerald-700 font-semibold">Xem ngay</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classmates Grid */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Danh sách bạn học cùng lớp ({classmates.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {classmates.map((mate) => {
                const isMe = mate.id === currentStudent.id;
                return (
                  <div
                    key={mate.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      isMe
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <img
                      src={mate.avatar}
                      alt={mate.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {mate.name}
                        </p>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 text-[9px] font-extrabold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {mate.code} · GPA: {mate.gpa}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
