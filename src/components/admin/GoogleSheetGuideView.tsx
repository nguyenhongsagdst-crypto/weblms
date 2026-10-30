import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useProviderSettings } from '../../providers/DataProviderContext';
import { FULL_APPS_SCRIPT_CODE } from '../../utils/appsScriptSource';
import {
  Database,
  FileSpreadsheet,
  Copy,
  Check,
  Table,
  Terminal,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const GoogleSheetGuideView: React.FC = () => {
  const { addToast } = useApp();
  const {
    providerType,
    setProviderType,
    webAppUrl,
    setWebAppUrl,
    mockProviderInstance,
    sheetProviderInstance,
  } = useProviderSettings();

  const [copied, setCopied] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState('CLASSES');
  const [inputUrl, setInputUrl] = useState(webAppUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Sync state
  const [isSyncingUp, setIsSyncingUp] = useState(false);
  const [isSyncingDown, setIsSyncingDown] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const schemas = [
    {
      key: 'CLASSES',
      title: 'Quản lí lớp học',
      description: 'Lưu trữ thông tin các lớp học, giáo viên chủ nhiệm, mã lớp, niên khóa và mã tham gia cho học sinh.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính duy nhất (VD: cls-1)' },
        { name: 'code', type: 'string', desc: 'Mã lớp ngắn gọn (VD: 10A1, 11B2)' },
        { name: 'name', type: 'string', desc: 'Tên đầy đủ của lớp học' },
        { name: 'gradeLevel', type: 'string', desc: 'Khối lớp (Khối 10, Khối 11, Khối 12)' },
        { name: 'academicYear', type: 'string', desc: 'Niên khóa học (VD: 2025 - 2026)' },
        { name: 'joinCode', type: 'string', desc: 'Mã định danh tham gia lớp cho học sinh (VD: EDU-10A1-X9)' },
        { name: 'teacherName', type: 'string', desc: 'Họ tên giáo viên phụ trách chủ nhiệm' },
        { name: 'room', type: 'string', desc: 'Phòng học vật lý hoặc phòng thực hành' },
        { name: 'description', type: 'string', desc: 'Định hướng và mục tiêu chuyên đề' },
      ],
    },
    {
      key: 'STUDENTS',
      title: 'Quản lí học sinh',
      description: 'Hồ sơ học sinh, tài khoản đăng nhập, liên kết lớp học, thông tin phụ huynh và GPA.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính học sinh (VD: std-1)' },
        { name: 'code', type: 'string', desc: 'Mã số học sinh (VD: HS-1001)' },
        { name: 'name', type: 'string', desc: 'Họ và tên đầy đủ của học sinh' },
        { name: 'username', type: 'string', desc: 'Tên đăng nhập hệ thống (VD: an.nguyen)' },
        { name: 'password', type: 'string', desc: 'Mật khẩu đăng nhập an toàn' },
        { name: 'classId', type: 'string', desc: 'Mã lớp học viên đang theo học (Foreign Key -> Classes.id)' },
        { name: 'birthDate', type: 'string (YYYY-MM-DD)', desc: 'Ngày tháng năm sinh' },
        { name: 'phone', type: 'string', desc: 'Số điện thoại cá nhân học sinh' },
        { name: 'parentPhone', type: 'string', desc: 'Số điện thoại phụ huynh để liên lạc khẩn cấp' },
        { name: 'email', type: 'string', desc: 'Email trường học cấp' },
        { name: 'avatar', type: 'url', desc: 'Đường dẫn ảnh đại diện học sinh' },
        { name: 'status', type: 'string', desc: 'Tình trạng: active (đang học) / inactive (tạm nghỉ)' },
        { name: 'gpa', type: 'number', desc: 'Điểm trung bình tích lũy hiện tại (0 - 10)' },
      ],
    },
    {
      key: 'SUBJECTS',
      title: 'Quản lí môn học',
      description: 'Danh mục môn học, mã môn, biểu tượng và màu sắc nhận diện trực quan.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính môn học (VD: sub-cs, sub-math)' },
        { name: 'code', type: 'string', desc: 'Mã môn học (VD: CS101, MATH10)' },
        { name: 'name', type: 'string', desc: 'Tên môn học chính thức' },
        { name: 'description', type: 'string', desc: 'Mô tả khái quát chương trình môn học' },
        { name: 'iconName', type: 'string', desc: 'Tên Lucide icon (VD: Code, Calculator, Atom, Globe)' },
        { name: 'color', type: 'string', desc: 'CSS Gradient Tailwind nhận diện môn học' },
      ],
    },
    {
      key: 'TOPICS',
      title: 'Quản lí chủ đề',
      description: 'Các chuyên đề hoặc chương mục bài giảng phân cấp theo từng môn học.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính chuyên đề (VD: top-cs-1)' },
        { name: 'subjectId', type: 'string', desc: 'Môn học trực thuộc (Foreign Key -> Subjects.id)' },
        { name: 'title', type: 'string', desc: 'Tên chủ đề bài học' },
        { name: 'description', type: 'string', desc: 'Mục tiêu kiến thức của chủ đề' },
        { name: 'order', type: 'number', desc: 'Thứ tự sắp xếp trong khung chương trình' },
      ],
    },
    {
      key: 'LESSONS',
      title: 'Quản lí bài giảng',
      description: 'Lưu trữ toàn bộ nội dung bài học, video nhúng, tài liệu đính kèm và danh sách lớp được giao.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính bài học (VD: les-1)' },
        { name: 'subjectId', type: 'string', desc: 'Mã môn học (Foreign Key -> Subjects.id)' },
        { name: 'topicId', type: 'string', desc: 'Mã chủ đề (Foreign Key -> Topics.id)' },
        { name: 'classIdsJson', type: 'JSON string', desc: 'Mảng JSON danh sách ID các lớp được học: ["cls-1", "cls-3"]' },
        { name: 'title', type: 'string', desc: 'Tiêu đề bài giảng' },
        { name: 'summary', type: 'string', desc: 'Tóm tắt bài học' },
        { name: 'content', type: 'text (Markdown)', desc: 'Nội dung bài học định dạng Markdown chuẩn' },
        { name: 'videoUrl', type: 'url', desc: 'Link video YouTube hoặc video bài giảng' },
        { name: 'durationMinutes', type: 'number', desc: 'Thời lượng ước tính (phút)' },
        { name: 'attachmentsJson', type: 'JSON string', desc: 'Mảng JSON file đính kèm: [{"name":"doc.pdf","url":"..."}]' },
        { name: 'isPublished', type: 'boolean', desc: 'TRUE: Đã phát hành; FALSE: Bản nháp' },
        { name: 'order', type: 'number', desc: 'Thứ tự hiển thị trong chủ đề' },
        { name: 'createdAt', type: 'ISO 8601 string', desc: 'Thời điểm tạo bài học' },
        { name: 'updatedAt', type: 'ISO 8601 string', desc: 'Thời điểm cập nhật gần nhất' },
      ],
    },
    {
      key: 'QUESTIONS',
      title: 'Quản lí ngân hàng câu hỏi',
      description: 'Kho lưu trữ câu hỏi trắc nghiệm, tự luận, đáp án giải thích và thang điểm phục vụ kiểm tra.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính câu hỏi (VD: qst-1)' },
        { name: 'subjectId', type: 'string', desc: 'Môn học (Foreign Key -> Subjects.id)' },
        { name: 'topicId', type: 'string', desc: 'Chủ đề (Foreign Key -> Topics.id)' },
        { name: 'type', type: 'string', desc: 'Loại câu hỏi: multiple_choice / essay / true_false' },
        { name: 'questionText', type: 'text', desc: 'Nội dung đề bài câu hỏi' },
        { name: 'optionsJson', type: 'JSON string', desc: 'Mảng JSON các lựa chọn: [{"id":"opt-1","text":"...","isCorrect":true}]' },
        { name: 'explanation', type: 'text', desc: 'Giải thích chi tiết đáp án đúng' },
        { name: 'defaultPoints', type: 'number', desc: 'Điểm số mặc định của câu hỏi (VD: 1.0)' },
        { name: 'difficulty', type: 'string', desc: 'Mức độ khó: easy / medium / hard' },
        { name: 'createdAt', type: 'ISO 8601 string', desc: 'Ngày tạo câu hỏi' },
      ],
    },
    {
      key: 'ASSIGNMENTS',
      title: 'Quản lí bài tập',
      description: 'Nhiệm vụ, bài tập về nhà kèm hạn nộp và tiêu chí chấm điểm ma trận Rubric chi tiết.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính bài tập (VD: asg-1)' },
        { name: 'classId', type: 'string', desc: 'Lớp học nhận bài tập (Foreign Key -> Classes.id)' },
        { name: 'subjectId', type: 'string', desc: 'Môn học liên quan (Foreign Key -> Subjects.id)' },
        { name: 'title', type: 'string', desc: 'Tiêu đề bài tập' },
        { name: 'description', type: 'text', desc: 'Mô tả yêu cầu chi tiết đề bài' },
        { name: 'dueDate', type: 'ISO 8601 string', desc: 'Hạn chót nộp bài (Deadline)' },
        { name: 'maxPoints', type: 'number', desc: 'Điểm tối đa tổng bài tập (thang 10)' },
        { name: 'rubricJson', type: 'JSON string', desc: 'Mảng tiêu chí chấm điểm: [{"id":"r1","title":"...","maxPoints":4}]' },
        { name: 'attachmentsJson', type: 'JSON string', desc: 'Mảng tài liệu đính kèm đề bài' },
        { name: 'status', type: 'string', desc: 'Trạng thái: published / draft / closed' },
        { name: 'createdAt', type: 'ISO 8601 string', desc: 'Thời điểm giao bài' },
      ],
    },
    {
      key: 'SUBMISSIONS',
      title: 'Quản lí bài nộp',
      description: 'Lưu trữ các bài nộp của học sinh, kết quả chấm theo từng tiêu chí Rubric và phản hồi của thầy cô.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính bài nộp (VD: subm-1)' },
        { name: 'assignmentId', type: 'string', desc: 'Mã bài tập (Foreign Key -> Assignments.id)' },
        { name: 'studentId', type: 'string', desc: 'Mã học sinh nộp bài (Foreign Key -> Students.id)' },
        { name: 'submittedAt', type: 'ISO 8601 string', desc: 'Thời điểm học sinh bấm nộp bài' },
        { name: 'content', type: 'text', desc: 'Nội dung bài làm, câu trả lời hoặc báo cáo' },
        { name: 'attachmentUrl', type: 'url', desc: 'Link tài liệu, link dự án GitHub/Drive bài nộp' },
        { name: 'status', type: 'string', desc: 'Trạng thái: pending / submitted / graded / late' },
        { name: 'score', type: 'number', desc: 'Tổng điểm số sau khi chấm (0 - 10)' },
        { name: 'rubricScoresJson', type: 'JSON string', desc: 'Đối tượng JSON điểm chi tiết từng tiêu chí: {"rub-1": 4.0, "rub-2": 3.0}' },
        { name: 'feedback', type: 'text', desc: 'Lời nhận xét đánh giá chi tiết của giáo viên' },
        { name: 'gradedAt', type: 'ISO 8601 string', desc: 'Thời điểm giáo viên hoàn thành chấm bài' },
        { name: 'gradedBy', type: 'string', desc: 'Tên giáo viên thực hiện chấm' },
      ],
    },
    {
      key: 'PROGRESS',
      title: 'Quản lí tiến độ bài học',
      description: 'Lưu vết lịch sử học tập, tình trạng hoàn thành bài học của từng học sinh.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính bản ghi tiến độ (VD: prog-1)' },
        { name: 'studentId', type: 'string', desc: 'Mã học sinh (Foreign Key -> Students.id)' },
        { name: 'lessonId', type: 'string', desc: 'Mã bài giảng (Foreign Key -> Lessons.id)' },
        { name: 'isCompleted', type: 'boolean', desc: 'TRUE = Đã hoàn thành; FALSE = Đang học' },
        { name: 'completedAt', type: 'ISO 8601 string', desc: 'Thời điểm đánh dấu hoàn thành' },
        { name: 'lastAccessedAt', type: 'ISO 8601 string', desc: 'Thời gian truy cập học gần nhất' },
      ],
    },
    {
      key: 'ANNOUNCEMENTS',
      title: 'Quản lí thông báo',
      description: 'Thông báo chính thức từ trường hoặc giáo viên bộ môn tới toàn trường hoặc từng lớp.',
      columns: [
        { name: 'id', type: 'string', desc: 'Khóa chính thông báo (VD: ann-1)' },
        { name: 'title', type: 'string', desc: 'Tiêu đề thông báo' },
        { name: 'content', type: 'text', desc: 'Nội dung chi tiết thông báo' },
        { name: 'authorName', type: 'string', desc: 'Họ tên người đăng' },
        { name: 'authorRole', type: 'string', desc: 'Ban Giám Hiệu / Giáo viên Bộ môn / Cố vấn' },
        { name: 'targetClassId', type: 'string', desc: 'Mã lớp nhận (Để trống = Toàn trường)' },
        { name: 'isPinned', type: 'boolean', desc: 'TRUE = Ghim lên vị trí đầu; FALSE = Thông thường' },
        { name: 'createdAt', type: 'ISO 8601 string', desc: 'Thời điểm đăng thông báo' },
      ],
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FULL_APPS_SCRIPT_CODE);
    setCopied(true);
    addToast('Đã sao chép toàn bộ mã nguồn Google Apps Script (814 dòng)!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveUrl = () => {
    setWebAppUrl(inputUrl.trim());
    addToast('Đã lưu URL Web App vào cấu hình hệ thống!', 'success');
  };

  const handleTestConnection = async () => {
    const url = inputUrl.trim();
    if (!url) {
      addToast('Vui lòng nhập Web App URL của Google Apps Script', 'error');
      return;
    }
    try {
      setIsTesting(true);
      setTestResult(null);
      const startTime = performance.now();
      const res = await fetch(url, { method: 'GET' });
      const duration = Math.round(performance.now() - startTime);
      const data = await res.json();
      setTestResult(
        `✓ Kết nối thành công (${duration}ms)!\nTrạng thái: ${data.status || 'OK'}\nHệ thống: ${data.system || 'EduCore LMS Apps Script'}\nPhiên bản: ${data.version || '1.3.0'}`
      );
      addToast('Kết nối Google Sheets Web App thành công!', 'success');
    } catch (err: any) {
      setTestResult(
        `✗ Lỗi kết nối: ${err.message}\nLưu ý: Bạn cần "Deploy as Web App" với quyền Execute as: "Me" và Who has access: "Anyone".`
      );
      addToast('Lỗi khi kiểm tra kết nối Web App', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Two-Way Sync Actions
  const handleSyncUpToSheets = async () => {
    const url = inputUrl.trim();
    if (!url) {
      addToast('Vui lòng cấu hình Web App URL trước khi đồng bộ', 'error');
      return;
    }
    try {
      setIsSyncingUp(true);
      setSyncStatus('Đang đọc toàn bộ dữ liệu từ Web (LocalStorage)...');
      const allLocalData = await mockProviderInstance.exportAllData();

      setSyncStatus('Đang gửi gói dữ liệu lên Google Apps Script /exec...');
      sheetProviderInstance.setWebAppUrl(url);
      const result: any = await sheetProviderInstance.syncAllFromWeb(allLocalData);

      setSyncStatus(
        `✓ Đồng bộ thành công 10 bảng lên Google Sheets lúc ${new Date().toLocaleTimeString()}!`
      );
      addToast('Đã đồng bộ toàn bộ dữ liệu Web lên Google Sheets thành công!', 'success');
    } catch (err: any) {
      setSyncStatus(`✗ Thất bại: ${err.message}`);
      addToast(`Lỗi đồng bộ: ${err.message}`, 'error');
    } finally {
      setIsSyncingUp(false);
    }
  };

  const handleSyncDownFromSheets = async () => {
    const url = inputUrl.trim();
    if (!url) {
      addToast('Vui lòng cấu hình Web App URL trước khi tải dữ liệu', 'error');
      return;
    }
    try {
      setIsSyncingDown(true);
      setSyncStatus('Đang kéo toàn bộ 10 bảng dữ liệu từ Google Sheets...');
      sheetProviderInstance.setWebAppUrl(url);
      const sheetData: any = await sheetProviderInstance.getAllData();

      setSyncStatus('Đang nạp dữ liệu vào bộ nhớ Web...');
      await mockProviderInstance.importAllData(sheetData);

      setSyncStatus(
        `✓ Đã nạp thành công dữ liệu từ Google Sheets về Web lúc ${new Date().toLocaleTimeString()}!`
      );
      addToast('Đã tải và cập nhật toàn bộ dữ liệu từ Google Sheets về Web!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setSyncStatus(`✗ Thất bại: ${err.message}`);
      addToast(`Lỗi tải dữ liệu: ${err.message}`, 'error');
    } finally {
      setIsSyncingDown(false);
    }
  };

  const selectedSchema = schemas.find((s) => s.key === activeSchemaTab) || schemas[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Google Sheet Database Schema & Web App API
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kiến trúc cơ sở dữ liệu 10 Tabs, hàm tự động{' '}
            <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono font-bold">
              setupDatabase()
            </code>{' '}
            và Web App <code className="bg-slate-100 text-emerald-600 px-1 py-0.5 rounded font-mono font-bold">/exec</code> đồng bộ 2 chiều.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép 814 dòng Code!' : 'Sao chép Toàn Bộ Apps Script'}</span>
          </button>
        </div>
      </div>

      {/* Two-Way Sync Control Panel */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>Trung Tâm Đồng Bộ Hai Chiều (Two-Way Synchronization)</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-indigo-200/70 mt-0.5">
                Chuyển đổi linh hoạt giữa Mock Provider và Google Sheets Provider mà không thay đổi bất kỳ thành phần UI nào.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200">Chế độ đang dùng:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                providerType === 'mock'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {providerType === 'mock' ? 'Mock (LocalStorage)' : 'Google Sheets Web App'}
            </span>
          </div>
        </div>

        {/* URL Input & Provider Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-indigo-800/80 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveUrl}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Lưu URL
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTesting ? 'Đang test...' : 'Test /exec'}</span>
            </button>
          </div>

          <div className="lg:col-span-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                const nextType = providerType === 'mock' ? 'sheet' : 'mock';
                setProviderType(nextType);
                addToast(
                  `Đã chuyển chế độ DataProvider sang: ${nextType === 'sheet' ? 'Google Sheets' : 'Mock LocalStorage'}`,
                  'info'
                );
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-400/40 text-xs font-bold text-white transition-all text-center"
            >
              Chuyển sang: {providerType === 'mock' ? 'Google Sheets' : 'Mock Provider'}
            </button>
          </div>
        </div>

        {/* Sync Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleSyncUpToSheets}
            disabled={isSyncingUp || isSyncingDown}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            <span>
              {isSyncingUp
                ? 'Đang đẩy toàn bộ dữ liệu...'
                : 'Đồng bộ TOÀN BỘ dữ liệu từ Web lên Google Sheets'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSyncDownFromSheets}
            disabled={isSyncingUp || isSyncingDown}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4 text-blue-200" />
            <span>
              {isSyncingDown
                ? 'Đang tải toàn bộ dữ liệu...'
                : 'Tải TOÀN BỘ dữ liệu từ Google Sheets về Web'}
            </span>
          </button>
        </div>

        {/* Feedback log */}
        {(syncStatus || testResult) && (
          <div className="p-3.5 rounded-xl bg-black/40 border border-indigo-900/60 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
            {syncStatus && <p className="text-indigo-200 font-semibold mb-1">{syncStatus}</p>}
            {testResult && <p className="text-slate-300">{testResult}</p>}
          </div>
        )}
      </div>

      {/* 4 Steps Quick Deployment Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            1
          </span>
          <p className="font-bold text-xs text-slate-900">Mở Google Sheet mới</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tạo một bảng tính Google Sheets mới hoặc mở trang tính hiện có của trường.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <p className="font-bold text-xs text-slate-900">Mở Apps Script</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> → <strong>Apps Script</strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <p className="font-bold text-xs text-slate-900">Chạy setupDatabase()</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Dán mã nguồn 814 dòng, chọn hàm <code className="text-indigo-600 font-mono font-bold">setupDatabase</code> và bấm <strong>Chạy (Run)</strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <p className="font-bold text-xs text-slate-900">Triển khai Web App</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Bấm <strong>Deploy</strong> → <strong>New deployment</strong> → Web app → Execute as: <em>Me</em>, Access: <em>Anyone</em>.
          </p>
        </div>
      </div>

      {/* Tabs Schema Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Cấu Trúc Chi Tiết Của 10 Bảng (Sheets Tabs Schema)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tất cả các trường JSON (rubricJson, optionsJson, classIdsJson...) được lưu dưới dạng chuỗi JSON string trong Sheet và tự động parse khi gửi về Web.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium self-start sm:self-auto">
            10 Tabs độc lập
          </span>
        </div>

        {/* Tab selection buttons */}
        <div className="flex flex-wrap gap-2">
          {schemas.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSchemaTab(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSchemaTab === s.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Selected Schema Table */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Tên Tab:</span>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md font-mono text-sm">
                  {selectedSchema.title}
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedSchema.description}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {selectedSchema.columns.length} cột headers
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tên Cột (Header)</th>
                  <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                  <th className="py-2.5 px-3">Mô tả & Định dạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedSchema.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                      {col.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          col.type.includes('JSON')
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-slate-100'
                        }`}
                      >
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-xs">
                      {col.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-slate-300">
              google-apps-script/setupDatabase.gs (814 lines • 35 KB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã copy mã nguồn' : 'Sao chép Toàn bộ'}</span>
          </button>
        </div>

        <pre className="font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto text-emerald-300/90 pr-2 select-all">
          {FULL_APPS_SCRIPT_CODE}
        </pre>
      </div>

      {/* Web App Actions Contract Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-600" />
          <span>Danh Sách Các Web App Actions (POST JSON {'{ action, payload }'})</span>
        </h3>
        <p className="text-xs text-slate-500">
          Web App Google Apps Script nhận request chuẩn RESTful qua POST JSON và phản hồi <code>{'{ success: true, data: ... }'}</code>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">syncAllFromWeb</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Ghi đè đồng bộ toàn bộ 10 bảng dữ liệu từ Web lên Google Sheet.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">getAllData</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Đọc toàn bộ dữ liệu 10 bảng từ Google Sheet gửi về Web.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">setupDatabase</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Khởi tạo 10 sheet tabs, định dạng header và nạp seed data nếu bảng trống.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">getClasses / createClass / ...</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Thao tác CRUD chi tiết từng lớp học theo ID.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">getStudents / createStudent / ...</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Quản lý hồ sơ học sinh, tài khoản, mật khẩu, phụ huynh.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold font-mono text-indigo-700">gradeSubmission</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Chấm điểm bài nộp theo từng tiêu chí Rubric và lưu nhận xét giáo viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
