import {
  ClassItem,
  Student,
  Subject,
  Topic,
  Lesson,
  LessonFilter,
  QuestionItem,
  QuestionFilter,
  StudentLessonProgress,
  Assignment,
  AssignmentFilter,
  Submission,
  SubmissionFilter,
  Announcement,
  ReportStats,
} from '../types';

/**
 * DataProvider Contract
 * This interface decouples UI components from the underlying storage mechanism.
 * Implementations:
 * - MockProvider (LocalStorage + SeedData)
 * - SheetProvider (Google Sheets / Google Apps Script API)
 * - RestApiProvider (Backend REST / GraphQL)
 */
export interface DataProvider {
  // Classes
  getClasses(): Promise<ClassItem[]>;
  getClassById(id: string): Promise<ClassItem | null>;
  createClass(data: Omit<ClassItem, 'id' | 'studentCount'>): Promise<ClassItem>;
  updateClass(id: string, data: Partial<ClassItem>): Promise<ClassItem>;
  deleteClass(id: string): Promise<boolean>;

  // Students
  getStudents(filters?: { classId?: string; search?: string }): Promise<Student[]>;
  getStudentById(id: string): Promise<Student | null>;
  createStudent(data: Omit<Student, 'id'>): Promise<Student>;
  updateStudent(id: string, data: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<boolean>;

  // Subjects & Topics
  getSubjects(): Promise<Subject[]>;
  getSubjectById(id: string): Promise<Subject | null>;
  getTopics(subjectId?: string): Promise<Topic[]>;
  createTopic(data: Omit<Topic, 'id'>): Promise<Topic>;
  updateTopic(id: string, data: Partial<Topic>): Promise<Topic>;
  deleteTopic(id: string): Promise<boolean>;

  // Lessons
  getLessons(filters?: LessonFilter): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson>;
  updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<boolean>;

  // Questions Bank
  getQuestions(filters?: QuestionFilter): Promise<QuestionItem[]>;
  getQuestionById(id: string): Promise<QuestionItem | null>;
  createQuestion(data: Omit<QuestionItem, 'id' | 'createdAt'>): Promise<QuestionItem>;
  updateQuestion(id: string, data: Partial<QuestionItem>): Promise<QuestionItem>;
  deleteQuestion(id: string): Promise<boolean>;

  // Student Lesson Progress
  getStudentProgress(studentId: string): Promise<StudentLessonProgress[]>;
  toggleLessonProgress(studentId: string, lessonId: string): Promise<StudentLessonProgress>;

  // Assignments
  getAssignments(filters?: AssignmentFilter): Promise<Assignment[]>;
  getAssignmentById(id: string): Promise<Assignment | null>;
  createAssignment(data: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment>;
  updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<boolean>;

  // Submissions
  getSubmissions(filters?: SubmissionFilter): Promise<Submission[]>;
  getSubmissionById(id: string): Promise<Submission | null>;
  submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content: string;
    attachmentUrl?: string;
  }): Promise<Submission>;
  gradeSubmission(
    id: string,
    gradeData: {
      score: number;
      rubricScores: Record<string, number>;
      feedback: string;
      gradedBy: string;
    }
  ): Promise<Submission>;

  // Gradebook
  getGradebook(classId: string): Promise<{
    classItem: ClassItem | null;
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
  }>;

  // Announcements
  getAnnouncements(filters?: { targetClassId?: string }): Promise<Announcement[]>;
  getAnnouncementById(id: string): Promise<Announcement | null>;
  createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // Reports
  getReports(classId?: string): Promise<ReportStats>;

  // System
  resetToSeedData(): Promise<void>;
}
