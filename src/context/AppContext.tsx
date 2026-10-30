import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types';
import { useDataProvider } from '../providers';

export type Role = 'admin' | 'app';

export type AdminTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'subjects'
  | 'lessons'
  | 'questions'
  | 'assignments'
  | 'submissions'
  | 'gradebook'
  | 'announcements'
  | 'reports'
  | 'sheet-guide';

export type StudentTab =
  | 'dashboard'
  | 'classes'
  | 'lessons'
  | 'assignments'
  | 'results'
  | 'announcements';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  studentTab: StudentTab;
  setStudentTab: (tab: StudentTab) => void;
  currentStudent: Student | null;
  setCurrentStudent: (student: Student) => void;
  allStudents: Student[];
  refreshStudents: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  quickNavigate: (role: Role, tab: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const provider = useDataProvider();

  // Read initial role from hash or pathname
  const getInitialRole = (): Role => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/app') || window.location.pathname.startsWith('/app')) {
        return 'app';
      }
    }
    return 'admin';
  };

  const [role, setRoleState] = useState<Role>(getInitialRole);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [studentTab, setStudentTab] = useState<StudentTab>('dashboard');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudentState] = useState<Student | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize URL hash
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      const targetTab = newRole === 'admin' ? adminTab : studentTab;
      window.location.hash = `#/${newRole}/${targetTab}`;
    }
  };

  const quickNavigate = (targetRole: Role, tab: string) => {
    setRoleState(targetRole);
    if (targetRole === 'admin') {
      setAdminTab(tab as AdminTab);
    } else {
      setStudentTab(tab as StudentTab);
    }
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${targetRole}/${tab}`;
    }
  };

  // Listen to hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const parts = hash.split('/');
      if (parts[0] === 'admin') {
        setRoleState('admin');
        if (parts[1]) setAdminTab(parts[1] as AdminTab);
      } else if (parts[0] === 'app') {
        setRoleState('app');
        if (parts[1]) setStudentTab(parts[1] as StudentTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshStudents = async () => {
    try {
      const students = await provider.getStudents();
      setAllStudents(students);
      if (!currentStudent && students.length > 0) {
        setCurrentStudentState(students[0]);
      }
    } catch (e) {
      console.error('Failed to load students:', e);
    }
  };

  useEffect(() => {
    refreshStudents();
  }, []);

  const setCurrentStudent = (student: Student) => {
    setCurrentStudentState(student);
    addToast(`Đã chuyển sang học sinh: ${student.name} (${student.code})`, 'info');
  };

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        adminTab,
        setAdminTab,
        studentTab,
        setStudentTab,
        currentStudent,
        setCurrentStudent,
        allStudents,
        refreshStudents,
        toasts,
        addToast,
        removeToast,
        quickNavigate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppContextProvider');
  return context;
};
