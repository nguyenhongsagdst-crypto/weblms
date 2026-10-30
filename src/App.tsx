import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClassesManager } from './components/admin/ClassesManager';
import { StudentsManager } from './components/admin/StudentsManager';
import { SubjectsTopicsManager } from './components/admin/SubjectsTopicsManager';
import { LessonsManager } from './components/admin/LessonsManager';
import { AssignmentsManager } from './components/admin/AssignmentsManager';
import { SubmissionsManager } from './components/admin/SubmissionsManager';
import { GradebookView } from './components/admin/GradebookView';
import { AnnouncementsManager } from './components/admin/AnnouncementsManager';
import { ReportsView } from './components/admin/ReportsView';
import { QuestionsBankManager } from './components/admin/QuestionsBankManager';
import { GoogleSheetGuideView } from './components/admin/GoogleSheetGuideView';

// Student views
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyClassesView } from './components/student/MyClassesView';
import { StudentLessonsView } from './components/student/StudentLessonsView';
import { StudentAssignmentsView } from './components/student/StudentAssignmentsView';
import { StudentResultsView } from './components/student/StudentResultsView';
import { StudentAnnouncementsView } from './components/student/StudentAnnouncementsView';

export const App: React.FC = () => {
  const { role, adminTab, studentTab } = useApp();

  const renderAdminContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'classes':
        return <ClassesManager />;
      case 'students':
        return <StudentsManager />;
      case 'subjects':
        return <SubjectsTopicsManager />;
      case 'lessons':
        return <LessonsManager />;
      case 'questions':
        return <QuestionsBankManager />;
      case 'assignments':
        return <AssignmentsManager />;
      case 'submissions':
        return <SubmissionsManager />;
      case 'gradebook':
        return <GradebookView />;
      case 'announcements':
        return <AnnouncementsManager />;
      case 'reports':
        return <ReportsView />;
      case 'sheet-guide':
        return <GoogleSheetGuideView />;
      default:
        return <AdminDashboard />;
    }
  };

  const renderStudentContent = () => {
    switch (studentTab) {
      case 'dashboard':
        return <StudentDashboard />;
      case 'classes':
        return <MyClassesView />;
      case 'lessons':
        return <StudentLessonsView />;
      case 'assignments':
        return <StudentAssignmentsView />;
      case 'results':
        return <StudentResultsView />;
      case 'announcements':
        return <StudentAnnouncementsView />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {role === 'admin' ? renderAdminContent() : renderStudentContent()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
export default App;
