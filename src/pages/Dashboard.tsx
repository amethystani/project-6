import React from 'react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
  FileSpreadsheet,
  Bell,
  Settings,
  BarChart,
  ClipboardCheck,
  FileBarChart,
  ArrowRight,
  Activity,
  Database,
  ShieldAlert,
  Server,
  Upload,
  FileText,
  PieChart,
  LineChart,
  Presentation,
  MessageSquare,
  ListChecks,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

const roleSpecificStats = {
  student: [
    { label: 'Enrolled Courses', value: '5', icon: BookOpen },
    { label: 'Assignments Due', value: '3', icon: Calendar },
    { label: 'Current GPA', value: '3.8', icon: GraduationCap },
    { label: 'Attendance Rate', value: '95%', icon: Users },
  ],
  faculty: [
    { label: 'Active Courses', value: '3', icon: BookOpen },
    { label: 'Total Students', value: '120', icon: Users },
    { label: 'Pending Grades', value: '25', icon: FileSpreadsheet },
    { label: 'Office Hours', value: '10hrs/week', icon: Calendar },
  ],
  admin: [
    { label: 'Total Users', value: '500', icon: Users },
    { label: 'Active Courses', value: '45', icon: BookOpen },
    { label: 'System Alerts', value: '2', icon: ShieldAlert },
    { label: 'Resource Usage', value: '85%', icon: Server },
  ],
  head: [
    { label: 'Department Size', value: '650', icon: Users },
    { label: 'Faculty Members', value: '35', icon: GraduationCap },
    { label: 'Course Success Rate', value: '92%', icon: BarChart },
    { label: 'Budget Utilization', value: '75%', icon: Settings },
  ],
  guest: [
    { label: 'Available Courses', value: '45', icon: BookOpen },
    { label: 'Faculty Members', value: '35', icon: Users },
    { label: 'Programs Offered', value: '8', icon: GraduationCap },
    { label: 'Success Rate', value: '92%', icon: BarChart },
  ],
};

// Department Head specific quick actions
const departmentHeadActions = [
  {
    title: 'Department Analytics',
    description: 'View department performance metrics',
    icon: BarChart,
    link: '/department-analytics',
    color: 'text-blue-600'
  },
  { 
    title: 'Approvals & Policy', 
    description: 'Manage requests & policies', 
    icon: ClipboardCheck,
    link: '/approvals-management' 
  },
  { 
    title: 'Reports & Strategy', 
    description: 'Generate reports', 
    icon: FileBarChart,
    link: '/reporting-strategy' 
  },
  { 
    title: 'Send Notice', 
    description: 'Notify department members', 
    icon: Bell,
    link: '/approvals-management' 
  },
];

// Department Head specific insights
const departmentInsights = [
  { 
    title: 'Enrollment increased in CS courses',
    trend: 'up',
    percentage: '15%'
  },
  { 
    title: 'Budget utilization below target',
    trend: 'down',
    percentage: '25%'
  },
  { 
    title: 'Faculty research publications up',
    trend: 'up',
    percentage: '22%'
  },
];

// Admin specific quick actions
const adminActions = [
  {
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    icon: Users,
    link: '/user-management',
    color: 'text-green-600'
  },
  { 
    title: 'Audit Logs', 
    description: 'Review system activity', 
    icon: Activity,
    link: '/audit-logs' 
  },
  { 
    title: 'Resource Allocation', 
    description: 'Track & allocate resources', 
    icon: Database,
    link: '/resource-allocation' 
  },
  { 
    title: 'System Settings', 
    description: 'Configure system parameters', 
    icon: Settings,
    link: '/system-settings' 
  },
];

// Admin specific system alerts
const systemAlerts = [
  { 
    title: 'Server load high during peak hours',
    severity: 'warning',
    time: '3 hours ago'
  },
  { 
    title: 'Automatic backup completed successfully',
    severity: 'info',
    time: '6 hours ago'
  },
  { 
    title: 'Failed login attempts for user ID 172',
    severity: 'critical',
    time: '1 day ago'
  },
];

// Faculty specific quick actions
const facultyActions = [
  {
    title: 'Course Management',
    description: 'Manage your courses and materials',
    icon: BookOpen,
    link: '/course-management',
    color: 'text-purple-600'
  },
  { 
    title: 'Grade Management', 
    description: 'Review and submit grades', 
    icon: FileSpreadsheet,
    link: '/grade-management' 
  },
  { 
    title: 'Student Attendance', 
    description: 'Track attendance records', 
    icon: Users,
    link: '/attendance-tracking' 
  },
  { 
    title: 'Office Hours', 
    description: 'Set up availability slots', 
    icon: Calendar,
    link: '/office-hours' 
  },
  { 
    title: 'Course Materials', 
    description: 'Manage study materials', 
    icon: FileText,
    link: '/course-materials' 
  },
  { 
    title: 'Performance Analytics', 
    description: 'View student performance', 
    icon: LineChart,
    link: '/performance-analytics' 
  },
];

// Faculty pending tasks
const pendingGrades = [
  { 
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    dueDate: 'Mar 15, 2024',
    studentsCount: 35
  },
  { 
    courseCode: 'CS305',
    courseName: 'Data Structures and Algorithms',
    dueDate: 'Mar 18, 2024',
    studentsCount: 42
  },
  { 
    courseCode: 'CS401',
    courseName: 'Advanced Database Systems',
    dueDate: 'Mar 22, 2024',
    studentsCount: 28
  },
];

// Faculty course management tools
const courseManagementTools = [
  {
    title: 'Edit Syllabus',
    description: 'Update course details and structure',
    icon: FileText,
    link: '/course-management/syllabus'
  },
  {
    title: 'Class Lists',
    description: 'View and manage student lists',
    icon: Users,
    link: '/course-management/class-lists'
  },
  {
    title: 'Post Announcements',
    description: 'Send updates to enrolled students',
    icon: MessageSquare,
    link: '/course-management/announcements'
  },
  {
    title: 'Upload Materials',
    description: 'Share study materials and resources',
    icon: Upload,
    link: '/course-management/materials'
  }
];

// Faculty grading tools
const gradingTools = [
  {
    title: 'Grade Entry',
    description: 'Enter or update student grades',
    icon: FileSpreadsheet,
    link: '/grade-management/entry'
  },
  {
    title: 'Bulk Upload',
    description: 'Upload CSV or Excel grade files',
    icon: Upload,
    link: '/grade-management/bulk-upload'
  },
  {
    title: 'Auto Calculate',
    description: 'Calculate weighted or curved grades',
    icon: PieChart,
    link: '/grade-management/auto-calculate'
  },
  {
    title: 'Rubric Builder',
    description: 'Create and manage grading rubrics',
    icon: ListChecks,
    link: '/grade-management/rubrics'
  }
];

// Faculty performance metrics
const coursePerformanceMetrics = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    avgScore: '78%',
    passRate: '92%',
    trend: 'up',
    change: '5%'
  },
  {
    courseCode: 'CS305',
    courseName: 'Data Structures and Algorithms',
    avgScore: '72%',
    passRate: '85%',
    trend: 'down',
    change: '3%'
  },
  {
    courseCode: 'CS401',
    courseName: 'Advanced Database Systems',
    avgScore: '81%',
    passRate: '94%',
    trend: 'up',
    change: '7%'
  }
];

// Student quick actions
const studentActions = [
  {
    title: 'Course Registration',
    description: 'Browse and register for available courses',
    icon: BookOpen,
    link: '/course-registration',
    color: 'text-blue-600'
  },
  {
    title: 'Assignments',
    description: 'View and submit assignments',
    icon: FileText,
    link: '/assignment-management',
    color: 'text-green-600'
  },
  {
    title: 'Academic Records',
    description: 'View grades and academic history',
    icon: GraduationCap,
    link: '/academic-records',
    color: 'text-amber-600'
  },
  {
    title: 'Schedule',
    description: 'View your weekly class schedule',
    icon: Calendar,
    link: '/schedule',
    color: 'text-purple-600'
  }
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const stats = roleSpecificStats[user?.role || 'guest'];
  const isHeadRole = user?.role === 'head';
  const isAdminRole = user?.role === 'admin';
  const isFacultyRole = user?.role === 'faculty';
  const isStudentRole = user?.role === 'student';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Welcome back, {user?.name}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={cn(
                "glass-card flex items-center gap-4 p-4 sm:p-6",
                "transform transition-transform hover:scale-102 hover:shadow-lg"
              )}
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {isHeadRole ? (
          // Department Head specific dashboard content
          <>
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {departmentHeadActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.link}
                    className="p-3 sm:p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left flex items-start gap-3"
                  >
                    <div className={`mt-1 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">Department Insights</h3>
                <Link to="/reporting-strategy" className="text-primary text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {departmentInsights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 border-b last:border-0">
                    <div className={`h-2 w-2 rounded-full ${insight.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">{insight.title}</p>
                      <p className="text-xs sm:text-sm text-foreground/60">Last 30 days</p>
                    </div>
                    <span className={`font-medium ${insight.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {insight.trend === 'up' ? '↑' : '↓'} {insight.percentage}
                    </span>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Link to="/department-analytics" className="flex items-center justify-center gap-2 w-full p-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <BarChart className="h-4 w-4" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : isAdminRole ? (
          // Admin specific dashboard content
          <>
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Admin Tools</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {adminActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.link}
                    className="p-3 sm:p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left flex items-start gap-3"
                  >
                    <div className={`mt-1 ${action.color ? action.color : 'text-primary'}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">System Alerts</h3>
                <Link to="/audit-logs" className="text-primary text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {systemAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 py-2 border-b last:border-0">
                    <div className={`mt-1 h-2 w-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' : 
                      alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base">{alert.title}</p>
                      <p className="text-xs sm:text-sm text-foreground/60">{alert.time}</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Link to="/system-settings" className="flex items-center justify-center gap-2 w-full p-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>System Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : isFacultyRole ? (
          // Faculty specific dashboard content
          <>
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Faculty Tools</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {facultyActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.link}
                    className="p-3 sm:p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left flex items-start gap-3"
                  >
                    <div className={`mt-1 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">Pending Grades</h3>
                <Link to="/grade-management" className="text-primary text-sm font-medium flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {pendingGrades.map((course, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">{course.courseCode}: {course.courseName}</p>
                      <p className="text-sm text-foreground/60">Due: {course.dueDate} • {course.studentsCount} students</p>
                    </div>
                    <Link 
                      to={`/grade-management/${course.courseCode}`}
                      className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md font-medium"
                    >
                      Grade
                    </Link>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Link to="/grade-management" className="flex items-center justify-center gap-2 w-full p-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Manage All Grades</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : isStudentRole ? (
          // Student specific dashboard content
          <>
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {studentActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.link}
                    className="p-3 sm:p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left flex items-start gap-3"
                  >
                    <div className={`mt-1 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-red-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Algorithm Design Exercise</h4>
                      <span className="text-xs font-medium text-red-600">Due in 2 days</span>
                    </div>
                    <p className="text-sm text-muted-foreground">CS101: Introduction to Computer Science</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-amber-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Midterm Exam</h4>
                      <span className="text-xs font-medium text-amber-600">In 5 days</span>
                    </div>
                    <p className="text-sm text-muted-foreground">MATH201: Linear Algebra</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-blue-500">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Group Presentation</h4>
                      <span className="text-xs font-medium text-blue-600">In 1 week</span>
                    </div>
                    <p className="text-sm text-muted-foreground">ENG102: Academic Writing</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link to="/assignment-management" className="text-primary text-sm hover:underline flex items-center">
                  <span>View all assignments</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          // Guest or unknown role content
          <div className="col-span-full glass-card">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">Welcome to the University Management System</h3>
              <p className="text-muted-foreground">Please log in to access your personalized dashboard.</p>
            </div>
          </div>
        )}
      </div>

      {isFacultyRole && (
        <>
          <div className="glass-card">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Upcoming Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">CS101: Introduction to Programming</p>
                    <p className="text-sm text-foreground/60">Today • 9:00 AM - 10:30 AM • Room 305</p>
                  </div>
                </div>
                <Link 
                  to="/course-management/CS101" 
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
                >
                  View
                </Link>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Office Hours</p>
                    <p className="text-sm text-foreground/60">Today • 1:00 PM - 3:00 PM • Room 210</p>
                  </div>
                </div>
                <Link 
                  to="/office-hours" 
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
                >
                  View
                </Link>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">CS305: Data Structures and Algorithms</p>
                    <p className="text-sm text-foreground/60">Tomorrow • 11:00 AM - 12:30 PM • Room 401</p>
                  </div>
                </div>
                <Link 
                  to="/course-management/CS305" 
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
                >
                  View
                </Link>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/schedule" className="text-primary text-sm font-medium flex items-center gap-1 w-full justify-center">
                View Complete Schedule
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Course Management Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseManagementTools.map((tool, i) => (
                  <Link
                    key={i}
                    to={tool.link}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tool.title}</p>
                      <p className="text-sm text-foreground/60">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Grading Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradingTools.map((tool, i) => (
                  <Link
                    key={i}
                    to={tool.link}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tool.title}</p>
                      <p className="text-sm text-foreground/60">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Course Performance Analytics</h3>
              <Link to="/performance-analytics" className="text-primary text-sm font-medium flex items-center gap-1">
                View Detailed Reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-foreground/70">Course</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground/70">Avg. Score</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground/70">Pass Rate</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground/70">Trend</th>
                    <th className="text-left p-3 text-sm font-medium text-foreground/70">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePerformanceMetrics.map((course, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-primary/5">
                      <td className="p-3">
                        <p className="font-medium">{course.courseCode}</p>
                        <p className="text-sm text-foreground/60">{course.courseName}</p>
                      </td>
                      <td className="p-3 font-medium">{course.avgScore}</td>
                      <td className="p-3 font-medium">{course.passRate}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          course.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {course.trend === 'up' ? '↑' : '↓'} {course.change}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link 
                            to={`/performance-analytics/${course.courseCode}`}
                            className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            <LineChart className="h-4 w-4" />
                          </Link>
                          <Link 
                            to={`/grade-management/${course.courseCode}`}
                            className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/performance-analytics/custom-reports"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <FileBarChart className="h-5 w-5 text-primary" />
                <span className="font-medium">Generate Custom Reports</span>
              </Link>
              <Link 
                to="/performance-analytics/course-comparison"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <BarChart className="h-5 w-5 text-primary" />
                <span className="font-medium">Compare Course Performance</span>
              </Link>
              <Link 
                to="/performance-analytics/export"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="font-medium">Export Analytics Data</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {isHeadRole && (
        <div className="glass-card">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Pending Approvals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">New Course Proposal: Advanced Machine Learning</p>
                  <p className="text-sm text-foreground/60">Submitted by Dr. Jane Smith on Mar 1, 2024</p>
                </div>
              </div>
              <Link 
                to="/approvals-management" 
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
              >
                Review
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Budget Request: Research Lab Equipment</p>
                  <p className="text-sm text-foreground/60">Submitted by Dr. Michael Johnson on Feb 28, 2024</p>
                </div>
              </div>
              <Link 
                to="/approvals-management" 
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
              >
                Review
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Faculty Resource Request: Teaching Assistant</p>
                  <p className="text-sm text-foreground/60">Submitted by Dr. Emily Chen on Feb 25, 2024</p>
                </div>
              </div>
              <Link 
                to="/approvals-management" 
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium"
              >
                Review
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/approvals-management" className="text-primary text-sm font-medium flex items-center gap-1 w-full justify-center">
              View All Pending Approvals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {isAdminRole && (
        <div className="glass-card">
          <h3 className="text-xl font-semibold mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Server Uptime</h4>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <p className="text-2xl font-bold">99.98%</p>
              <p className="text-sm text-foreground/60">Last 30 days</p>
              <div className="w-full h-2 bg-primary/10 rounded-full mt-3">
                <div className="h-full bg-primary rounded-full" style={{ width: '99.98%' }}></div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">CPU Usage</h4>
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">Moderate</span>
              </div>
              <p className="text-2xl font-bold">68%</p>
              <p className="text-sm text-foreground/60">Current</p>
              <div className="w-full h-2 bg-primary/10 rounded-full mt-3">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Memory Usage</h4>
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">High</span>
              </div>
              <p className="text-2xl font-bold">82%</p>
              <p className="text-sm text-foreground/60">Current</p>
              <div className="w-full h-2 bg-primary/10 rounded-full mt-3">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/system-settings" className="text-primary text-sm font-medium flex items-center gap-1 w-full justify-center">
              View Complete System Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}