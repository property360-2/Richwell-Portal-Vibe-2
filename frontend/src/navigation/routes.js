export const navConfig = {
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/student/grades', label: 'Grades', icon: '📘' },
    { to: '/student/notifications', label: 'Announcements', icon: '🔔' }
  ],
  REGISTRAR: [
    { to: '/registrar/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/registrar/students', label: 'Student Records', icon: '🎓' },
    { to: '/registrar/analytics', label: 'Analytics', icon: '📈' }
  ],
  ADMISSION: [
    { to: '/admission/dashboard', label: 'Dashboard', icon: '🗂️' },
    { to: '/admission/students', label: 'Applicants', icon: '📝' }
  ],
  PROFESSOR: [
    { to: '/professor/dashboard', label: 'Dashboard', icon: '🎯' },
    { to: '/professor/classes', label: 'My Classes', icon: '👩‍🏫' },
    { to: '/professor/grades', label: 'Grades', icon: '✅' }
  ],
  DEAN: [
    { to: '/dean/dashboard', label: 'Dashboard', icon: '⭐' },
    { to: '/dean/analytics', label: 'Analytics', icon: '📈' }
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '⚙️' },
    { to: '/admin/settings', label: 'Settings', icon: '🛠️' }
  ]
};

export default navConfig;
