/**
 * =========================================================================
 * GOOGLE APPS SCRIPT WEB APP (/exec) CHO HỆ THỐNG "LMS QUẢN LÍ HỌC TẬP"
 * =========================================================================
 * 
 * Hướng dẫn triển khai Web App:
 * 1. Mở Google Sheet -> Tiện ích mở rộng (Extensions) -> Apps Script.
 * 2. Dán toàn bộ mã nguồn này vào trình soạn thảo Apps Script.
 * 3. Chạy hàm `setupDatabase()` trước 1 lần để tạo 10 tabs kèm header & seed data.
 * 4. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Triển khai mới" (New deployment).
 *    - Loại triển khai: Ứng dụng web (Web App)
 *    - Mô tả: LMS API Backend v1.3
 *    - Thực thi dưới dạng: Tôi (Execute as: Me)
 *    - Ai có quyền truy cập: Bất kỳ ai (Who has access: Anyone)
 * 5. Bấm "Triển khai" (Deploy), cấp quyền và sao chép URL kết thúc bằng `/exec`.
 * 6. Dán URL đó vào tab "/admin -> Google Sheet & Script" trên web LMS để đồng bộ!
 */

// Cấu hình bảng và cột chuẩn hóa
var LMS_SCHEMA = {
  CLASSES: {
    sheetName: 'Quản lí lớp học',
    headers: ['id', 'code', 'name', 'gradeLevel', 'academicYear', 'joinCode', 'teacherName', 'room', 'description'],
    jsonFields: [],
    seedRows: [
      ['cls-1', '10A1', 'Lớp 10A1 - Chuyên Tin & Khoa học Máy tính', 'Khối 10', '2025 - 2026', 'EDU-10A1-X9', 'ThS. Nguyễn Hoàng Nam', 'Phòng Lab 302', 'Lớp trọng điểm định hướng CNTT.'],
      ['cls-2', '10A2', 'Lớp 10A2 - Khối Tự Nhiên & STEM', 'Khối 10', '2025 - 2026', 'EDU-10A2-K2', 'Cô Trần Thị Thu Trang', 'Phòng 204 - Dãy B', 'Chương trình tăng cường STEM thực nghiệm.'],
      ['cls-3', '11B1', 'Lớp 11B1 - Ngoại ngữ & Tin học Quốc tế', 'Khối 11', '2025 - 2026', 'EDU-11B1-W5', 'Thầy David Lê Minh', 'Phòng Hội thảo A1', 'Đào tạo chuẩn song ngữ và ứng dụng web.'],
      ['cls-4', '12C1', 'Lớp 12C1 - Luyện thi & Ứng dụng Chuyên sâu', 'Khối 12', '2025 - 2026', 'EDU-12C1-Q7', 'TS. Phạm Quang Dũng', 'Phòng 401 - Tòa Tri Thức', 'Luyện thi quốc gia và capstone.']
    ]
  },

  STUDENTS: {
    sheetName: 'Quản lí học sinh',
    headers: ['id', 'code', 'name', 'username', 'password', 'classId', 'birthDate', 'phone', 'parentPhone', 'email', 'avatar', 'status', 'gpa'],
    jsonFields: [],
    seedRows: [
      ['std-1', 'HS-1001', 'Nguyễn Văn An', 'an.nguyen', 'Password@123', 'cls-1', '2009-03-15', '0912 345 678', '0903 111 222', 'an.nguyen@lms.edu.vn', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active', 8.8],
      ['std-2', 'HS-1002', 'Trần Thị Mai', 'mai.tran', 'Password@123', 'cls-1', '2009-07-22', '0988 112 233', '0918 333 444', 'mai.tran@lms.edu.vn', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active', 9.4],
      ['std-3', 'HS-1003', 'Lê Quốc Bảo', 'bao.le', 'Password@123', 'cls-1', '2009-11-05', '0903 456 789', '0937 555 666', 'bao.le@lms.edu.vn', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active', 7.9],
      ['std-4', 'HS-1004', 'Phạm Minh Khang', 'khang.pham', 'Password@123', 'cls-1', '2009-01-30', '0934 567 890', '0908 777 888', 'khang.pham@lms.edu.vn', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active', 8.5],
      ['std-5', 'HS-1005', 'Hoàng Thùy Linh', 'linh.hoang', 'Password@123', 'cls-2', '2009-05-18', '0977 889 900', '0912 888 999', 'linh.hoang@lms.edu.vn', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'active', 9.1]
    ]
  },

  SUBJECTS: {
    sheetName: 'Quản lí môn học',
    headers: ['id', 'code', 'name', 'description', 'iconName', 'color'],
    jsonFields: [],
    seedRows: [
      ['sub-cs', 'CS101', 'Lập trình Web & Ứng dụng', 'Lập trình Frontend hiện đại với HTML5, Tailwind CSS, TypeScript và React.', 'Code', 'from-blue-600 to-indigo-600'],
      ['sub-math', 'MATH10', 'Toán học & Giải tích Ứng dụng', 'Hàm số, giới hạn, đạo hàm và bài toán thực tế.', 'Calculator', 'from-emerald-600 to-teal-600'],
      ['sub-phy', 'PHY10', 'Vật lý Đại cương & STEM', 'Động lực học chất điểm, năng lượng, điện từ học.', 'Atom', 'from-amber-500 to-orange-600'],
      ['sub-eng', 'ENG11', 'Tiếng Anh Học thuật & Thuyết trình', 'Rèn luyện kỹ năng viết luận, thuyết trình công nghệ.', 'Globe', 'from-purple-600 to-pink-600'],
      ['sub-lit', 'LIT10', 'Ngữ văn & Tư duy Phản biện', 'Nghị luận xã hội, phân tích văn học.', 'BookOpen', 'from-rose-500 to-red-600']
    ]
  },

  TOPICS: {
    sheetName: 'Quản lí chủ đề',
    headers: ['id', 'subjectId', 'title', 'description', 'order'],
    jsonFields: [],
    seedRows: [
      ['top-cs-1', 'sub-cs', 'Chủ đề 1: Nền tảng Web & Cấu trúc DOM', 'HTML5 ngữ nghĩa và Box Model.', 1],
      ['top-cs-2', 'sub-cs', 'Chủ đề 2: JavaScript ES6+ & TypeScript', 'Hàm mũi tên, promise, async/await.', 2],
      ['top-cs-3', 'sub-cs', 'Chủ đề 3: Kiến trúc React & Component Lifecycle', 'State, props, hooks.', 3],
      ['top-math-1', 'sub-math', 'Chủ đề 1: Khảo sát Hàm số & Đồ thị', 'Sự biến thiên, cực trị hàm số.', 1],
      ['top-math-2', 'sub-math', 'Chủ đề 2: Đạo hàm & Bài toán Tối ưu', 'Cực trị và bài toán thực tế.', 2]
    ]
  },

  LESSONS: {
    sheetName: 'Quản lí bài giảng',
    headers: ['id', 'subjectId', 'topicId', 'classIdsJson', 'title', 'summary', 'content', 'videoUrl', 'durationMinutes', 'attachmentsJson', 'isPublished', 'order', 'createdAt', 'updatedAt'],
    jsonFields: ['classIdsJson', 'attachmentsJson'],
    seedRows: [
      [
        'les-1',
        'sub-cs',
        'top-cs-1',
        JSON.stringify(['cls-1', 'cls-3']),
        'Bài 1: Cấu trúc HTML5 Ngữ nghĩa & Semantic Tags',
        'Tìm hiểu các thẻ ngữ nghĩa header, nav, main, section, article.',
        '## 1. Giới thiệu Semantic HTML5\nThẻ ngữ nghĩa cung cấp ý nghĩa rõ ràng cho cả trình duyệt lẫn lập trình viên.',
        'https://www.youtube.com/embed/kUMe1FH4CHE',
        45,
        JSON.stringify([{ name: 'HTML5_CheatSheet.pdf', url: 'https://example.com/html5.pdf', type: 'pdf', size: '1.4 MB' }]),
        true,
        1,
        '2026-09-01T08:00:00Z',
        '2026-09-05T10:00:00Z'
      ],
      [
        'les-2',
        'sub-cs',
        'top-cs-2',
        JSON.stringify(['cls-1', 'cls-3']),
        'Bài 2: JavaScript Hiện đại: Async/Await & Fetch API',
        'Xử lý bất đồng bộ trong JavaScript, cơ chế Event Loop, Promise chaining.',
        '## Cơ chế Bất đồng bộ trong JS\nAsync/Await giúp viết mã đồng bộ rõ ràng và bắt lỗi try/catch an toàn.',
        'https://www.youtube.com/embed/V_Kr9OSfDeU',
        60,
        JSON.stringify([]),
        true,
        2,
        '2026-09-08T08:00:00Z',
        '2026-09-08T08:00:00Z'
      ]
    ]
  },

  QUESTIONS: {
    sheetName: 'Quản lí ngân hàng câu hỏi',
    headers: ['id', 'subjectId', 'topicId', 'type', 'questionText', 'optionsJson', 'explanation', 'defaultPoints', 'difficulty', 'createdAt'],
    jsonFields: ['optionsJson'],
    seedRows: [
      [
        'qst-1',
        'sub-cs',
        'top-cs-1',
        'multiple_choice',
        'Thẻ ngữ nghĩa (semantic tag) nào trong HTML5 nên được sử dụng để bao bọc các liên kết điều hướng chính?',
        JSON.stringify([
          { id: 'opt-1-1', text: '<div class="navigation">', isCorrect: false },
          { id: 'opt-1-2', text: '<nav>', isCorrect: true },
          { id: 'opt-1-3', text: '<menu>', isCorrect: false },
          { id: 'opt-1-4', text: '<links>', isCorrect: false }
        ]),
        'Thẻ <nav> được định nghĩa trong HTML5 dành riêng cho khối liên kết điều hướng chính.',
        1.0,
        'easy',
        '2026-09-05T08:00:00Z'
      ],
      [
        'qst-2',
        'sub-cs',
        'top-cs-2',
        'multiple_choice',
        'Trong JavaScript, từ khóa nào cho phép tạm dừng việc thực thi một hàm async cho đến khi một Promise được giải quyết (resolve)?',
        JSON.stringify([
          { id: 'opt-2-1', text: 'pause', isCorrect: false },
          { id: 'opt-2-2', text: 'await', isCorrect: true },
          { id: 'opt-2-3', text: 'wait', isCorrect: false },
          { id: 'opt-2-4', text: 'defer', isCorrect: false }
        ]),
        'Từ khóa await chỉ có thể được sử dụng bên trong các hàm async và tạm dừng hàm để chờ kết quả của Promise.',
        1.5,
        'medium',
        '2026-09-10T09:00:00Z'
      ]
    ]
  },

  ASSIGNMENTS: {
    sheetName: 'Quản lí bài tập',
    headers: ['id', 'classId', 'subjectId', 'title', 'description', 'dueDate', 'maxPoints', 'rubricJson', 'attachmentsJson', 'status', 'createdAt'],
    jsonFields: ['rubricJson', 'attachmentsJson'],
    seedRows: [
      [
        'asg-1',
        'cls-1',
        'sub-cs',
        'Bài tập 01: Thiết kế Trang Dashboard Trợ Năng Bằng Semantic HTML5',
        'Xây dựng layout giao diện bảng điều khiển quản lý học tập tuân thủ chuẩn ngữ nghĩa HTML5, hỗ trợ phím tắt.',
        '2026-11-15T23:59:59Z',
        10,
        JSON.stringify([
          { id: 'rub-1-1', title: 'Tính chuẩn mực Semantic HTML', maxPoints: 4, description: 'Sử dụng đúng các thẻ header, nav, main, article, section, footer.' },
          { id: 'rub-1-2', title: 'Trợ năng (Accessibility & ARIA)', maxPoints: 3, description: 'Đầy đủ aria-label, alt cho hình ảnh.' },
          { id: 'rub-1-3', title: 'Tổ chức mã nguồn & Clean Code', maxPoints: 2, description: 'Format mã nguồn sạch sẽ, chú thích rõ ràng.' },
          { id: 'rub-1-4', title: 'Sáng tạo & Tính thẩm mỹ', maxPoints: 1, description: 'Giao diện hài hòa, tương phản chuẩn WCAG AA.' }
        ]),
        JSON.stringify([{ name: 'Dashboard_Spec.pdf', url: 'https://example.com/spec.pdf', type: 'pdf', size: '1.5 MB' }]),
        'published',
        '2026-09-02T10:00:00Z'
      ]
    ]
  },

  SUBMISSIONS: {
    sheetName: 'Quản lí bài nộp',
    headers: ['id', 'assignmentId', 'studentId', 'submittedAt', 'content', 'attachmentUrl', 'status', 'score', 'rubricScoresJson', 'feedback', 'gradedAt', 'gradedBy'],
    jsonFields: ['rubricScoresJson'],
    seedRows: [
      [
        'subm-1',
        'asg-1',
        'std-1',
        '2026-09-04T15:30:00Z',
        'Em đã hoàn thành bài tập thiết kế Dashboard theo đúng cấu trúc ngữ nghĩa HTML5 với các thẻ <header>, <nav>, <main>.',
        'https://github.com/an-nguyen/lms-semantic-dashboard',
        'graded',
        9.5,
        JSON.stringify({ 'rub-1-1': 4.0, 'rub-1-2': 3.0, 'rub-1-3': 1.8, 'rub-1-4': 0.7 }),
        'Bài làm rất xuất sắc An ơi! Cấu trúc HTML5 cực kỳ chuẩn chỉ.',
        '2026-09-06T09:30:00Z',
        'ThS. Nguyễn Hoàng Nam'
      ]
    ]
  },

  PROGRESS: {
    sheetName: 'Quản lí tiến độ bài học',
    headers: ['id', 'studentId', 'lessonId', 'isCompleted', 'completedAt', 'lastAccessedAt'],
    jsonFields: [],
    seedRows: [
      ['prog-1', 'std-1', 'les-1', true, '2026-09-02T16:00:00Z', '2026-09-04T10:00:00Z']
    ]
  },

  ANNOUNCEMENTS: {
    sheetName: 'Quản lí thông báo',
    headers: ['id', 'title', 'content', 'authorName', 'authorRole', 'targetClassId', 'isPinned', 'createdAt'],
    jsonFields: [],
    seedRows: [
      [
        'ann-1',
        'Lịch thi Kiểm tra Đánh giá Năng lực Giữa Học kỳ I (Năm học 2025 - 2026)',
        'Ban Giám Hiệu nhà trường xin thông báo kế hoạch kiểm tra giữa kỳ 1...',
        'ThS. Lê Hoàng Yến',
        'Ban Giám Hiệu',
        '',
        true,
        '2026-09-20T08:00:00Z'
      ]
    ]
  }
};

/**
 * =========================================================================
 * 1. HÀM KHỞI TẠO HỆ THỐNG: setupDatabase()
 * =========================================================================
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var key in LMS_SCHEMA) {
    if (!LMS_SCHEMA.hasOwnProperty(key)) continue;
    var table = LMS_SCHEMA[key];
    var sheet = ss.getSheetByName(table.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(table.sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(table.headers);
      var headerRange = sheet.getRange(1, 1, 1, table.headers.length);
      headerRange.setFontWeight('bold').setFontColor('#ffffff').setBackground('#1e293b').setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      if (table.seedRows && table.seedRows.length > 0) {
        var numRows = table.seedRows.length;
        var numCols = table.headers.length;
        var dataRange = sheet.getRange(2, 1, numRows, numCols);
        dataRange.setValues(table.seedRows);
        dataRange.setVerticalAlignment('middle');
        sheet.getRange(1, 1, numRows + 1, numCols).setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
      }
      for (var col = 1; col <= table.headers.length; col++) {
        sheet.autoResizeColumn(col);
      }
    }
  }

  // Dọn dẹp sheet trống mặc định nếu có
  var defaultSheets = ['Sheet1', 'Trang tính1'];
  for (var i = 0; i < defaultSheets.length; i++) {
    var def = ss.getSheetByName(defaultSheets[i]);
    if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(def);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Khởi tạo Database LMS thành công!', 'EduCore LMS');
  return { success: true, message: 'Database setup completed' };
}

/**
 * =========================================================================
 * 2. CÁC HÀM TIỆN ÍCH ĐỌC / GHI SHEET BẢO MẬT & CHUẨN HÓA DỮ LIỆU
 * =========================================================================
 */
function getSheetConfig(schemaKey) {
  return LMS_SCHEMA[schemaKey];
}

// Đọc toàn bộ danh sách bản ghi từ Sheet thành mảng Object
function readTable(schemaKey) {
  var table = LMS_SCHEMA[schemaKey];
  if (!table) throw new Error('Không tìm thấy bảng: ' + schemaKey);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table.sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);

  return rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, idx) {
      var val = row[idx];
      // Tự động Parse chuỗi JSON string thành object / array
      if (header.indexOf('Json') !== -1 || (table.jsonFields && table.jsonFields.indexOf(header) !== -1)) {
        if (typeof val === 'string' && val.trim() !== '') {
          try {
            item[header.replace('Json', '')] = JSON.parse(val);
            item[header] = JSON.parse(val);
          } catch (e) {
            item[header] = val;
          }
        } else {
          item[header] = val;
        }
      } else {
        item[header] = val;
      }
    });
    return item;
  });
}

// Ghi đè toàn bộ một bảng (dùng trong đồng bộ Bulk Sync)
function overwriteTable(schemaKey, items) {
  var table = LMS_SCHEMA[schemaKey];
  if (!table) throw new Error('Không tìm thấy bảng: ' + schemaKey);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table.sheetName) || ss.insertSheet(table.sheetName);

  // Xóa sạch dữ liệu cũ
  sheet.clearContents();

  // Ghi Headers
  sheet.appendRow(table.headers);
  var headerRange = sheet.getRange(1, 1, 1, table.headers.length);
  headerRange.setFontWeight('bold').setFontColor('#ffffff').setBackground('#1e293b').setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  if (!items || items.length === 0) return true;

  var rows = items.map(function(item) {
    return table.headers.map(function(col) {
      var rawVal = item[col];
      // Nếu là trường JSON
      if (col.indexOf('Json') !== -1) {
        var plainKey = col.replace('Json', '');
        var valToSerialize = item[col] !== undefined ? item[col] : item[plainKey];
        return (typeof valToSerialize === 'object' && valToSerialize !== null) ? JSON.stringify(valToSerialize) : (valToSerialize || '[]');
      }
      if (typeof rawVal === 'object' && rawVal !== null) {
        return JSON.stringify(rawVal);
      }
      return rawVal !== undefined ? rawVal : '';
    });
  });

  var dataRange = sheet.getRange(2, 1, rows.length, table.headers.length);
  dataRange.setValues(rows);
  dataRange.setVerticalAlignment('middle');
  return true;
}

// Thêm hoặc Cập nhật 1 dòng theo ID
function upsertRow(schemaKey, item) {
  var table = LMS_SCHEMA[schemaKey];
  if (!table) throw new Error('Không tìm thấy bảng: ' + schemaKey);
  if (!item.id) throw new Error('Bản ghi thiếu ID');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table.sheetName) || ss.insertSheet(table.sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0] || table.headers;

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.id)) {
      rowIndex = i + 1; // 1-indexed trong Sheets
      break;
    }
  }

  var rowValues = headers.map(function(col) {
    var rawVal = item[col];
    if (col.indexOf('Json') !== -1) {
      var plainKey = col.replace('Json', '');
      var valToSerialize = item[col] !== undefined ? item[col] : item[plainKey];
      return (typeof valToSerialize === 'object' && valToSerialize !== null) ? JSON.stringify(valToSerialize) : (valToSerialize || '[]');
    }
    if (typeof rawVal === 'object' && rawVal !== null) {
      return JSON.stringify(rawVal);
    }
    return rawVal !== undefined ? rawVal : '';
  });

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return item;
}

// Xóa 1 dòng theo ID
function deleteRow(schemaKey, id) {
  var table = LMS_SCHEMA[schemaKey];
  if (!table) throw new Error('Không tìm thấy bảng: ' + schemaKey);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(table.sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return true;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

/**
 * =========================================================================
 * 3. WEB APP ENDPOINTS: doGet & doPost
 * Nhận POST JSON { action, payload } và hỗ trợ ĐỒNG BỘ TOÀN BỘ BẢNG
 * =========================================================================
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'status';

  if (action === 'getAllData') {
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: getAllDatabaseData()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    system: 'EduCore LMS Google Sheets Backend',
    version: '1.3.0',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Concurrency Lock: Ngăn chặn xung đột khi nhiều người ghi đồng thời
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(20000); // Đợi tối đa 20s

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Hệ thống đang bận xử lý một thao tác ghi khác. Vui lòng thử lại sau giây lát.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawContents = e.postData.contents;
    var request = JSON.parse(rawContents);
    var action = request.action;
    var payload = request.payload || request.data || request;

    var responseData = null;

    switch (action) {
      // ----------------- TOÀN BỘ BẢNG: ĐỒNG BỘ BULK SYNC -----------------
      case 'syncAllFromWeb':
        // Nhận payload chứa toàn bộ dữ liệu 10 bảng từ Web để ghi đồng loạt lên Sheet
        responseData = syncAllFromWeb(payload);
        break;

      case 'getAllData':
        // Đọc toàn bộ 10 bảng gửi về cho Web trong 1 network request duy nhất
        responseData = getAllDatabaseData();
        break;

      case 'setupDatabase':
        responseData = setupDatabase();
        break;

      case 'resetToSeedData':
        responseData = resetToSeedDataAction();
        break;

      // ----------------- CLASSES (LỚP HỌC) -----------------
      case 'getClasses':
        responseData = readTable('CLASSES');
        break;
      case 'getClassById':
        var classes = readTable('CLASSES');
        responseData = classes.find(function(c) { return c.id === payload.id; }) || null;
        break;
      case 'createClass':
      case 'updateClass':
        var classItem = payload.data || payload;
        if (!classItem.id) classItem.id = 'cls-' + new Date().getTime();
        responseData = upsertRow('CLASSES', classItem);
        break;
      case 'deleteClass':
        responseData = deleteRow('CLASSES', payload.id);
        break;

      // ----------------- STUDENTS (HỌC SINH) -----------------
      case 'getStudents':
        var students = readTable('STUDENTS');
        if (payload && payload.filters && payload.filters.classId) {
          students = students.filter(function(s) { return s.classId === payload.filters.classId; });
        }
        responseData = students;
        break;
      case 'getStudentById':
        var studentsList = readTable('STUDENTS');
        responseData = studentsList.find(function(s) { return s.id === payload.id; }) || null;
        break;
      case 'createStudent':
      case 'updateStudent':
        var studentItem = payload.data || payload;
        if (!studentItem.id) studentItem.id = 'std-' + new Date().getTime();
        responseData = upsertRow('STUDENTS', studentItem);
        break;
      case 'deleteStudent':
        responseData = deleteRow('STUDENTS', payload.id);
        break;

      // ----------------- SUBJECTS & TOPICS (MÔN & CHỦ ĐỀ) -----------------
      case 'getSubjects':
        responseData = readTable('SUBJECTS');
        break;
      case 'getTopics':
        var topics = readTable('TOPICS');
        if (payload && payload.subjectId) {
          topics = topics.filter(function(t) { return t.subjectId === payload.subjectId; });
        }
        responseData = topics;
        break;
      case 'createTopic':
      case 'updateTopic':
        var topicItem = payload.data || payload;
        if (!topicItem.id) topicItem.id = 'top-' + new Date().getTime();
        responseData = upsertRow('TOPICS', topicItem);
        break;
      case 'deleteTopic':
        responseData = deleteRow('TOPICS', payload.id);
        break;

      // ----------------- LESSONS (BÀI GIẢNG) -----------------
      case 'getLessons':
        var lessons = readTable('LESSONS');
        if (payload && payload.filters) {
          var f = payload.filters;
          if (f.subjectId) lessons = lessons.filter(function(l) { return l.subjectId === f.subjectId; });
          if (f.topicId) lessons = lessons.filter(function(l) { return l.topicId === f.topicId; });
          if (f.isPublished !== undefined) lessons = lessons.filter(function(l) { return Boolean(l.isPublished) === Boolean(f.isPublished); });
        }
        responseData = lessons;
        break;
      case 'createLesson':
      case 'updateLesson':
        var lessonItem = payload.data || payload;
        if (!lessonItem.id) lessonItem.id = 'les-' + new Date().getTime();
        if (!lessonItem.createdAt) lessonItem.createdAt = new Date().toISOString();
        lessonItem.updatedAt = new Date().toISOString();
        responseData = upsertRow('LESSONS', lessonItem);
        break;
      case 'deleteLesson':
        responseData = deleteRow('LESSONS', payload.id);
        break;

      // ----------------- QUESTIONS (NGÂN HÀNG CÂU HỎI) -----------------
      case 'getQuestions':
        var questions = readTable('QUESTIONS');
        if (payload && payload.filters) {
          var qf = payload.filters;
          if (qf.subjectId) questions = questions.filter(function(q) { return q.subjectId === qf.subjectId; });
          if (qf.type) questions = questions.filter(function(q) { return q.type === qf.type; });
          if (qf.difficulty) questions = questions.filter(function(q) { return q.difficulty === qf.difficulty; });
        }
        responseData = questions;
        break;
      case 'createQuestion':
      case 'updateQuestion':
        var questionItem = payload.data || payload;
        if (!questionItem.id) questionItem.id = 'qst-' + new Date().getTime();
        if (!questionItem.createdAt) questionItem.createdAt = new Date().toISOString();
        responseData = upsertRow('QUESTIONS', questionItem);
        break;
      case 'deleteQuestion':
        responseData = deleteRow('QUESTIONS', payload.id);
        break;

      // ----------------- ASSIGNMENTS (BÀI TẬP) -----------------
      case 'getAssignments':
        var assignments = readTable('ASSIGNMENTS');
        if (payload && payload.filters) {
          var af = payload.filters;
          if (af.classId) assignments = assignments.filter(function(a) { return a.classId === af.classId; });
          if (af.subjectId) assignments = assignments.filter(function(a) { return a.subjectId === af.subjectId; });
        }
        responseData = assignments;
        break;
      case 'createAssignment':
      case 'updateAssignment':
        var asgItem = payload.data || payload;
        if (!asgItem.id) asgItem.id = 'asg-' + new Date().getTime();
        if (!asgItem.createdAt) asgItem.createdAt = new Date().toISOString();
        responseData = upsertRow('ASSIGNMENTS', asgItem);
        break;
      case 'deleteAssignment':
        responseData = deleteRow('ASSIGNMENTS', payload.id);
        break;

      // ----------------- SUBMISSIONS (BÀI NỘP & CHẤM ĐIỂM) -----------------
      case 'getSubmissions':
        var submissions = readTable('SUBMISSIONS');
        if (payload && payload.filters) {
          var sf = payload.filters;
          if (sf.assignmentId) submissions = submissions.filter(function(s) { return s.assignmentId === sf.assignmentId; });
          if (sf.studentId) submissions = submissions.filter(function(s) { return s.studentId === sf.studentId; });
          if (sf.status) submissions = submissions.filter(function(s) { return s.status === sf.status; });
        }
        responseData = submissions;
        break;
      case 'submitAssignment':
        var subData = payload.data || payload;
        var existingSubs = readTable('SUBMISSIONS');
        var foundSub = existingSubs.find(function(s) {
          return s.assignmentId === subData.assignmentId && s.studentId === subData.studentId;
        });

        var targetSub = {
          id: foundSub ? foundSub.id : 'subm-' + new Date().getTime(),
          assignmentId: subData.assignmentId,
          studentId: subData.studentId,
          submittedAt: new Date().toISOString(),
          content: subData.content,
          attachmentUrl: subData.attachmentUrl || '',
          status: 'submitted',
          score: foundSub ? foundSub.score : '',
          rubricScoresJson: foundSub ? foundSub.rubricScoresJson : '{}',
          feedback: foundSub ? foundSub.feedback : '',
          gradedAt: foundSub ? foundSub.gradedAt : '',
          gradedBy: foundSub ? foundSub.gradedBy : ''
        };
        responseData = upsertRow('SUBMISSIONS', targetSub);
        break;
      case 'gradeSubmission':
        var gradeInfo = payload.gradeData || payload;
        var subId = payload.id;
        var currentSub = readTable('SUBMISSIONS').find(function(s) { return s.id === subId; });
        if (!currentSub) throw new Error('Không tìm thấy bài nộp ID: ' + subId);

        currentSub.score = gradeInfo.score;
        currentSub.rubricScoresJson = gradeInfo.rubricScores;
        currentSub.feedback = gradeInfo.feedback;
        currentSub.gradedBy = gradeInfo.gradedBy;
        currentSub.gradedAt = new Date().toISOString();
        currentSub.status = 'graded';
        responseData = upsertRow('SUBMISSIONS', currentSub);
        break;

      // ----------------- PROGRESS (TIẾN ĐỘ BÀI HỌC) -----------------
      case 'getStudentProgress':
        var progress = readTable('PROGRESS');
        if (payload && payload.studentId) {
          progress = progress.filter(function(p) { return p.studentId === payload.studentId; });
        }
        responseData = progress;
        break;
      case 'toggleLessonProgress':
        var progList = readTable('PROGRESS');
        var pStu = payload.studentId;
        var pLes = payload.lessonId;
        var nowStr = new Date().toISOString();
        var progItem = progList.find(function(p) { return p.studentId === pStu && p.lessonId === pLes; });

        if (progItem) {
          progItem.isCompleted = !progItem.isCompleted;
          progItem.completedAt = progItem.isCompleted ? nowStr : '';
          progItem.lastAccessedAt = nowStr;
        } else {
          progItem = {
            id: 'prog-' + new Date().getTime(),
            studentId: pStu,
            lessonId: pLes,
            isCompleted: true,
            completedAt: nowStr,
            lastAccessedAt: nowStr
          };
        }
        responseData = upsertRow('PROGRESS', progItem);
        break;

      // ----------------- ANNOUNCEMENTS (THÔNG BÁO) -----------------
      case 'getAnnouncements':
        var announcements = readTable('ANNOUNCEMENTS');
        if (payload && payload.filters && payload.filters.targetClassId) {
          announcements = announcements.filter(function(a) {
            return !a.targetClassId || a.targetClassId === payload.filters.targetClassId;
          });
        }
        responseData = announcements;
        break;
      case 'createAnnouncement':
      case 'updateAnnouncement':
        var annItem = payload.data || payload;
        if (!annItem.id) annItem.id = 'ann-' + new Date().getTime();
        if (!annItem.createdAt) annItem.createdAt = new Date().toISOString();
        responseData = upsertRow('ANNOUNCEMENTS', annItem);
        break;
      case 'deleteAnnouncement':
        responseData = deleteRow('ANNOUNCEMENTS', payload.id);
        break;

      // ----------------- GRADEBOOK & REPORTS -----------------
      case 'getGradebook':
        var gClassId = payload.classId;
        var gClass = readTable('CLASSES').find(function(c) { return c.id === gClassId; }) || null;
        var gStudents = readTable('STUDENTS').filter(function(s) { return s.classId === gClassId; });
        var gAssignments = readTable('ASSIGNMENTS').filter(function(a) { return a.classId === gClassId; });
        var gAsgIds = gAssignments.map(function(a) { return a.id; });
        var gSubmissions = readTable('SUBMISSIONS').filter(function(s) { return gAsgIds.indexOf(s.assignmentId) !== -1; });
        responseData = {
          classItem: gClass,
          students: gStudents,
          assignments: gAssignments,
          submissions: gSubmissions
        };
        break;

      default:
        throw new Error('Action không được hỗ trợ: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      action: action,
      data: responseData,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 4. ĐỒNG BỘ TOÀN BỘ BẢNG (BULK SYNC TWO-WAY)
 * =========================================================================
 */

// Đọc toàn bộ dữ liệu 10 bảng gửi về cho Web
function getAllDatabaseData() {
  return {
    classes: readTable('CLASSES'),
    students: readTable('STUDENTS'),
    subjects: readTable('SUBJECTS'),
    topics: readTable('TOPICS'),
    lessons: readTable('LESSONS'),
    questions: readTable('QUESTIONS'),
    assignments: readTable('ASSIGNMENTS'),
    submissions: readTable('SUBMISSIONS'),
    progress: readTable('PROGRESS'),
    announcements: readTable('ANNOUNCEMENTS')
  };
}

// Đồng bộ toàn bộ dữ liệu từ Web ghi đè lên Google Sheet
function syncAllFromWeb(payload) {
  var data = payload.data || payload;
  var counts = {};

  if (data.classes) { overwriteTable('CLASSES', data.classes); counts.classes = data.classes.length; }
  if (data.students) { overwriteTable('STUDENTS', data.students); counts.students = data.students.length; }
  if (data.subjects) { overwriteTable('SUBJECTS', data.subjects); counts.subjects = data.subjects.length; }
  if (data.topics) { overwriteTable('TOPICS', data.topics); counts.topics = data.topics.length; }
  if (data.lessons) { overwriteTable('LESSONS', data.lessons); counts.lessons = data.lessons.length; }
  if (data.questions) { overwriteTable('QUESTIONS', data.questions); counts.questions = data.questions.length; }
  if (data.assignments) { overwriteTable('ASSIGNMENTS', data.assignments); counts.assignments = data.assignments.length; }
  if (data.submissions) { overwriteTable('SUBMISSIONS', data.submissions); counts.submissions = data.submissions.length; }
  if (data.progress) { overwriteTable('PROGRESS', data.progress); counts.progress = data.progress.length; }
  if (data.announcements) { overwriteTable('ANNOUNCEMENTS', data.announcements); counts.announcements = data.announcements.length; }

  return {
    success: true,
    message: 'Đã đồng bộ toàn bộ 10 bảng dữ liệu từ Web lên Google Sheets thành công!',
    counts: counts,
    timestamp: new Date().toISOString()
  };
}

function resetToSeedDataAction() {
  for (var key in LMS_SCHEMA) {
    var table = LMS_SCHEMA[key];
    var items = table.seedRows.map(function(row) {
      var item = {};
      table.headers.forEach(function(h, idx) {
        item[h] = row[idx];
      });
      return item;
    });
    overwriteTable(key, items);
  }
  return { success: true, message: 'Đã khôi phục dữ liệu mẫu trên Google Sheets' };
}
