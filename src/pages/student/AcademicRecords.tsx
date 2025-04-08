import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Award, 
  Clock,
  AlertTriangle,
  Bell,
  FileText,
  Bookmark,
  BarChart,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Share2,
  ExternalLink,
  CheckCircle,
  Filter,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Card, Table, Tag, Badge, Progress, Tabs, Collapse, Button, Empty, Select, Tooltip, Divider, Space, Statistic, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

// Mock data for academic terms
const ACADEMIC_TERMS = [
  {
    id: 'term4',
    name: 'Spring 2023',
    status: 'current',
    gpa: 3.8,
    credits: 15,
    courses: [
      {
        id: 'CS101',
        name: 'Introduction to Computer Science',
        grade: 'A',
        credits: 3,
        instructor: 'Dr. Alan Turing',
        status: 'in_progress',
        marks: 92
      },
      {
        id: 'MATH201',
        name: 'Linear Algebra',
        grade: 'A-',
        credits: 4,
        instructor: 'Dr. Katherine Johnson',
        status: 'in_progress',
        marks: 88
      },
      {
        id: 'PHYS101',
        name: 'Physics I: Mechanics',
        grade: 'B+',
        credits: 4,
        instructor: 'Dr. Richard Feynman',
        status: 'in_progress',
        marks: 85
      },
      {
        id: 'ENG102',
        name: 'Academic Writing',
        grade: 'A',
        credits: 3,
        instructor: 'Prof. Maya Angelou',
        status: 'in_progress',
        marks: 94
      }
    ],
    year: 2,
    semester: 2,
    classification: 'Sophomore'
  },
  {
    id: 'term3',
    name: 'Fall 2022',
    status: 'completed',
    gpa: 3.75,
    credits: 16,
    courses: [
      {
        id: 'MATH101',
        name: 'Calculus I',
        grade: 'A',
        credits: 4,
        instructor: 'Dr. Isaac Newton',
        status: 'completed',
        marks: 95
      },
      {
        id: 'ENG101',
        name: 'Composition',
        grade: 'B+',
        credits: 3,
        instructor: 'Prof. Ernest Hemingway',
        status: 'completed',
        marks: 87
      },
      {
        id: 'HIST101',
        name: 'World History',
        grade: 'A-',
        credits: 3,
        instructor: 'Dr. Howard Zinn',
        status: 'completed',
        marks: 89
      },
      {
        id: 'CHEM101',
        name: 'General Chemistry',
        grade: 'B',
        credits: 4,
        instructor: 'Dr. Marie Curie',
        status: 'completed',
        marks: 83
      },
      {
        id: 'ART101',
        name: 'Art Appreciation',
        grade: 'A',
        credits: 2,
        instructor: 'Prof. Frida Kahlo',
        status: 'completed',
        marks: 92
      }
    ],
    year: 2,
    semester: 1,
    classification: 'Sophomore'
  },
  {
    id: 'term2',
    name: 'Spring 2022',
    status: 'completed',
    gpa: 3.5,
    credits: 14,
    courses: [
      {
        id: 'BIO101',
        name: 'Introduction to Biology',
        grade: 'B+',
        credits: 4,
        instructor: 'Dr. Charles Darwin',
        status: 'completed',
        marks: 86
      },
      {
        id: 'SOC101',
        name: 'Introduction to Sociology',
        grade: 'A',
        credits: 3,
        instructor: 'Prof. Max Weber',
        status: 'completed',
        marks: 93
      },
      {
        id: 'PSYCH101',
        name: 'Introduction to Psychology',
        grade: 'A-',
        credits: 3,
        instructor: 'Dr. Sigmund Freud',
        status: 'completed',
        marks: 89
      },
      {
        id: 'ECON101',
        name: 'Principles of Economics',
        grade: 'B',
        credits: 4,
        instructor: 'Dr. Adam Smith',
        status: 'completed',
        marks: 82
      }
    ],
    year: 1,
    semester: 2,
    classification: 'Freshman'
  },
  {
    id: 'term1',
    name: 'Fall 2021',
    status: 'completed',
    gpa: 3.4,
    credits: 15,
    courses: [
      {
        id: 'CS100',
        name: 'Computer Literacy',
        grade: 'A-',
        credits: 3,
        instructor: 'Dr. Ada Lovelace',
        status: 'completed',
        marks: 88
      },
      {
        id: 'MATH100',
        name: 'Precalculus',
        grade: 'B+',
        credits: 4,
        instructor: 'Dr. Leonhard Euler',
        status: 'completed',
        marks: 85
      },
      {
        id: 'ENG100',
        name: 'Introduction to College Writing',
        grade: 'A',
        credits: 3,
        instructor: 'Prof. Virginia Woolf',
        status: 'completed',
        marks: 91
      },
      {
        id: 'PHIL101',
        name: 'Introduction to Philosophy',
        grade: 'B',
        credits: 3,
        instructor: 'Dr. Aristotle',
        status: 'completed',
        marks: 82
      },
      {
        id: 'PE101',
        name: 'Physical Education',
        grade: 'A',
        credits: 2,
        instructor: 'Coach Johnson',
        status: 'completed',
        marks: 94
      }
    ],
    year: 1,
    semester: 1,
    classification: 'Freshman'
  }
];

// Mock data for upcoming alerts
const UPCOMING_ALERTS = [
  {
    id: 'alert1',
    type: 'exam',
    course: 'CS101',
    courseName: 'Introduction to Computer Science',
    title: 'Midterm Exam',
    date: '2023-05-20T10:00:00',
    location: 'Engineering Hall 305',
    description: 'Covers algorithms, data structures, and basic programming concepts. Bring a calculator and student ID.'
  },
  {
    id: 'alert2',
    type: 'project',
    course: 'PHYS101',
    courseName: 'Physics I: Mechanics',
    title: 'Lab Project Deadline',
    date: '2023-05-18T23:59:59',
    description: 'Submit your pendulum motion analysis lab report through the online portal.'
  },
  {
    id: 'alert3',
    type: 'faculty',
    course: 'MATH201',
    courseName: 'Linear Algebra',
    title: 'Office Hours Cancelled',
    date: '2023-05-15T13:30:00',
    description: 'Professor Johnson\'s office hours on May 15th are cancelled. Additional hours available on May 16th.'
  },
  {
    id: 'alert4',
    type: 'enrollment',
    title: 'Fall 2023 Registration Opens',
    date: '2023-05-25T09:00:00',
    description: 'Course registration for Fall 2023 semester will open on May 25th. Check your registration time slot.'
  }
];

// Degree requirements mock data
const DEGREE_REQUIREMENTS = {
  program: 'Computer Science, B.S.',
  totalCreditsRequired: 120,
  completedCredits: 45,
  requirements: [
    {
      category: 'Core Computer Science',
      required: 36,
      completed: 12,
      courses: [
        { id: 'CS101', name: 'Introduction to Computer Science', credits: 3, status: 'completed' },
        { id: 'CS201', name: 'Data Structures', credits: 3, status: 'planned' },
        { id: 'CS210', name: 'Computer Architecture', credits: 3, status: 'planned' },
        { id: 'CS220', name: 'Algorithms', credits: 3, status: 'planned' },
        { id: 'CS230', name: 'Database Systems', credits: 3, status: 'planned' },
        { id: 'CS240', name: 'Operating Systems', credits: 3, status: 'not_started' },
        { id: 'CS250', name: 'Computer Networks', credits: 3, status: 'not_started' },
        { id: 'CS260', name: 'Software Engineering', credits: 3, status: 'not_started' },
        { id: 'CS310', name: 'Artificial Intelligence', credits: 3, status: 'not_started' },
        { id: 'CS320', name: 'Programming Languages', credits: 3, status: 'not_started' },
        { id: 'CS340', name: 'Cybersecurity', credits: 3, status: 'not_started' },
        { id: 'CS390', name: 'Senior Project', credits: 3, status: 'not_started' }
      ]
    },
    {
      category: 'Mathematics',
      required: 16,
      completed: 11,
      courses: [
        { id: 'MATH101', name: 'Calculus I', credits: 4, status: 'completed' },
        { id: 'MATH201', name: 'Linear Algebra', credits: 4, status: 'in_progress' },
        { id: 'MATH202', name: 'Calculus II', credits: 4, status: 'planned' },
        { id: 'MATH301', name: 'Discrete Mathematics', credits: 4, status: 'not_started' }
      ]
    },
    {
      category: 'Science',
      required: 12,
      completed: 8,
      courses: [
        { id: 'PHYS101', name: 'Physics I: Mechanics', credits: 4, status: 'in_progress' },
        { id: 'CHEM101', name: 'General Chemistry', credits: 4, status: 'completed' },
        { id: 'PHYS102', name: 'Physics II: Electricity and Magnetism', credits: 4, status: 'not_started' }
      ]
    },
    {
      category: 'General Education',
      required: 56,
      completed: 14,
      courses: [
        { id: 'ENG101', name: 'Composition', credits: 3, status: 'completed' },
        { id: 'ENG102', name: 'Academic Writing', credits: 3, status: 'in_progress' },
        { id: 'HIST101', name: 'World History', credits: 3, status: 'completed' },
        { id: 'ART101', name: 'Art Appreciation', credits: 2, status: 'completed' },
        { id: 'SOC101', name: 'Introduction to Sociology', credits: 3, status: 'completed' },
        // More courses would be listed here
      ]
    }
  ]
};

// GPA calculation helper
const getGradePoint = (grade: string) => {
  switch (grade) {
    case 'A': return 10.0;
    case 'A-': return 9.0;
    case 'B+': return 8.0;
    case 'B': return 7.0;
    case 'B-': return 6.0;
    case 'C+': return 5.0;
    case 'C': return 4.0;
    case 'C-': return 3.0;
    case 'D+': return 2.0;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
};

// Grade color helper
const getGradeColor = (grade: string) => {
  const gradePoint = getGradePoint(grade);
  if (gradePoint >= 9.0) return 'green';
  if (gradePoint >= 7.0) return 'blue';
  if (gradePoint >= 5.0) return 'orange';
  return 'red';
};

const AcademicRecords = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState(ACADEMIC_TERMS);
  const [alerts, setAlerts] = useState(UPCOMING_ALERTS);
  const [degreeRequirements, setDegreeRequirements] = useState(DEGREE_REQUIREMENTS);
  const [expandedTerm, setExpandedTerm] = useState<string | null>('term4'); // Default to current term
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('transcript');
  const [searchText, setSearchText] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate cumulative GPA
  const calculateCumulativeGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    terms.forEach(term => {
      term.courses.forEach(course => {
        if (course.status === 'completed' || course.status === 'in_progress') {
          totalPoints += getGradePoint(course.grade) * course.credits;
          totalCredits += course.credits;
        }
      });
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };
  
  // Calculate SGPA for current semester
  const calculateCurrentSGPA = () => {
    const currentTerm = terms.find(term => term.status === 'current');
    if (!currentTerm) return '0.00';
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    currentTerm.courses.forEach(course => {
      totalPoints += getGradePoint(course.grade) * course.credits;
      totalCredits += course.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };
  
  // Calculate total credits earned
  const calculateTotalCredits = () => {
    return terms.reduce((sum, term) => 
      term.status === 'completed' 
        ? sum + term.credits 
        : sum, 
      0
    );
  };
  
  // Get progress status for term
  const getProgressStatus = (term: typeof ACADEMIC_TERMS[0]) => {
    if (term.status === 'completed') return 'success';
    if (term.status === 'current') return 'active';
    return 'wait';
  };
  
  // Get days until alert
  const getDayDifference = (dateString: string) => {
    const now = new Date();
    const alertDate = new Date(dateString);
    const diffTime = alertDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get alert urgency class
  const getAlertUrgencyClass = (dateString: string) => {
    const days = getDayDifference(dateString);
    if (days < 0) return 'bg-gray-100 text-gray-800';
    if (days <= 2) return 'bg-red-100 text-red-800';
    if (days <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  // Get alert type icon
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText size={20} className="text-blue-500" />;
      case 'project': return <Bookmark size={20} className="text-green-500" />;
      case 'faculty': return <Bell size={20} className="text-orange-500" />;
      case 'enrollment': return <Calendar size={20} className="text-purple-500" />;
      default: return <AlertTriangle size={20} className="text-red-500" />;
    }
  };
  
  // Get unique terms for filter
  const years = Array.from(new Set(terms.map(term => term.name.split(' ')[1]))).sort().reverse();
  
  // Get all courses for filter
  const courses = terms.flatMap(term => term.courses.map(course => course.id));
  const uniqueCourses = Array.from(new Set(courses)).sort();
  
  // Filter courses based on search and filters
  const getFilteredCourses = (termCourses: any[]) => {
    return termCourses.filter(course => {
      const matchesSearch = 
        course.id.toLowerCase().includes(searchText.toLowerCase()) ||
        course.name.toLowerCase().includes(searchText.toLowerCase());
        
      const matchesCourse = courseFilter ? course.id === courseFilter : true;
      
      return matchesSearch && matchesCourse;
    });
  };
  
  // Filter terms based on year filter
  const filteredTerms = terms.filter(term => {
    if (!yearFilter) return true;
    return term.name.includes(yearFilter);
  });
  
  // Get student classification based on year and semester
  const getStudentClassification = (year: number, semester: number) => {
    if (year === 1) return 'Freshman';
    if (year === 2) return 'Sophomore';
    if (year === 3) return 'Junior';
    if (year === 4) return 'Senior';
    return 'Graduate Student';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Academic Records</h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mt-4 md:mt-0 gap-2">
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                CGPA: {calculateCumulativeGPA()}
              </span>
            </div>
            
            <div className="flex items-center bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg">
              <Award className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Credits: {calculateTotalCredits()}/{degreeRequirements.totalCreditsRequired}
              </span>
            </div>

            <div className="flex items-center bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg">
              <BookOpen className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Current SGPA: {calculateCurrentSGPA()}
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button 
              icon={<Download size={16} />}
              onClick={() => window.print()}
            >
              Export
            </Button>
            <Button 
              icon={<Printer size={16} />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        </div>
        
        {/* Tabs for different views */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          className="mb-6"
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <FileText size={16} className="mr-2" />
                Transcript
              </span>
            } 
            key="transcript"
          />
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <BarChart size={16} className="mr-2" />
                Degree Progress
              </span>
            } 
            key="degreeProgress"
          />
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                Academic Alerts
                {alerts.length > 0 && (
                  <Badge count={alerts.length} size="small" style={{ marginLeft: 5 }} />
                )}
              </span>
            } 
            key="alerts"
          />
        </Tabs>
        
        {/* Transcript Tab Content */}
        {activeTab === 'transcript' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Select
                  placeholder="Filter by Year"
                  style={{ width: 150 }}
                  value={yearFilter || undefined}
                  onChange={setYearFilter}
                  allowClear
                  onClear={() => setYearFilter('')}
                >
                  {years.map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
                
                <Select
                  placeholder="Filter by Course"
                  style={{ width: 180 }}
                  value={courseFilter || undefined}
                  onChange={setCourseFilter}
                  allowClear
                  onClear={() => setCourseFilter('')}
                  showSearch
                >
                  {uniqueCourses.map(course => (
                    <Option key={course} value={course}>{course}</Option>
                  ))}
                </Select>
                
                <Input.Search
                  placeholder="Search courses"
                  style={{ width: 200 }}
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                  onSearch={(value: string) => setSearchText(value)}
                />
              </div>
            </div>
            
            <div className="official-transcript border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 bg-white dark:bg-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-1">OFFICIAL TRANSCRIPT</h2>
                <p className="text-gray-600 dark:text-gray-400">Shivaji University</p>
                <p className="text-gray-600 dark:text-gray-400">Student ID: 12345678</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p><strong>Name:</strong> John Doe</p>
                    <p><strong>Major:</strong> Computer Science</p>
                    <p><strong>Classification:</strong> {terms.find(t => t.status === 'current')?.classification || 'Unknown'}</p>
                    <p><strong>Admission Date:</strong> August 15, 2021</p>
                    <p><strong>Current Year:</strong> {terms.find(t => t.status === 'current')?.year || 'Unknown'}</p>
                    <p><strong>Current Semester:</strong> {terms.find(t => t.status === 'current')?.semester || 'Unknown'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Academic Summary</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p><strong>Cumulative GPA (CGPA):</strong> {calculateCumulativeGPA()}</p>
                    <p><strong>Current Semester GPA (SGPA):</strong> {calculateCurrentSGPA()}</p>
                    <p><strong>Total Credits Earned:</strong> {calculateTotalCredits()}</p>
                    <p><strong>Credits In Progress:</strong> {terms.find(t => t.status === 'current')?.credits || 0}</p>
                    <p><strong>Academic Standing:</strong> Good Standing</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Academic History</h3>
                
                {filteredTerms.length === 0 ? (
                  <Empty description="No terms match your search criteria" />
                ) : (
                  <Collapse
                    defaultActiveKey={[expandedTerm || '']}
                    onChange={(key) => setExpandedTerm(Array.isArray(key) ? key[0] : key)}
                    className="transcript-collapse"
                  >
                    {filteredTerms.map(term => {
                      const filteredCourses = getFilteredCourses(term.courses);
                      
                      if (filteredCourses.length === 0 && (searchText || courseFilter)) {
                        return null;
                      }
                      
                      return (
                        <Panel
                          key={term.id}
                          header={
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center">
                                <span className="font-semibold">{term.name}</span>
                                {term.status === 'current' && (
                                  <Tag color="blue" className="ml-2">Current</Tag>
                                )}
                                <Tag color="purple" className="ml-2">{term.classification}</Tag>
                                <Tag color="cyan" className="ml-2">Year {term.year}, Semester {term.semester}</Tag>
                              </div>
                              <div className="text-sm flex items-center">
                                <span className="mr-4">SGPA: {term.gpa.toFixed(2)}</span>
                                <span>Credits: {term.credits}</span>
                              </div>
                            </div>
                          }
                        >
                          <Table
                            dataSource={filteredCourses}
                            pagination={false}
                            rowKey="id"
                            columns={[
                              {
                                title: 'Course',
                                dataIndex: 'id',
                                key: 'id',
                                render: (id) => <Tag color="blue">{id}</Tag>
                              },
                              {
                                title: 'Course Name',
                                dataIndex: 'name',
                                key: 'name',
                              },
                              {
                                title: 'Credits',
                                dataIndex: 'credits',
                                key: 'credits',
                                align: 'center',
                              },
                              {
                                title: 'Instructor',
                                dataIndex: 'instructor',
                                key: 'instructor',
                              },
                              {
                                title: 'Grade',
                                dataIndex: 'grade',
                                key: 'grade',
                                align: 'center',
                                render: (grade, record) => (
                                  <Tag 
                                    color={getGradeColor(grade)}
                                    className="font-semibold"
                                  >
                                    {grade}
                                  </Tag>
                                )
                              },
                              {
                                title: 'Marks',
                                dataIndex: 'marks',
                                key: 'marks',
                                align: 'center',
                                render: (marks, record: any) => (
                                  marks ? 
                                  <span className="font-semibold">{marks}/100</span> : 
                                  <span className="text-gray-500">No marks found</span>
                                )
                              },
                              {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                align: 'center',
                                render: (status) => {
                                  let color = 'default';
                                  let text = 'Unknown';
                                  
                                  if (status === 'completed') {
                                    color = 'green';
                                    text = 'Completed';
                                  } else if (status === 'in_progress') {
                                    color = 'blue';
                                    text = 'In Progress';
                                  }
                                  
                                  return <Tag color={color}>{text}</Tag>;
                                }
                              }
                            ]}
                            summary={(pageData) => {
                              let totalCredits = 0;
                              let totalPoints = 0;
                              let totalMarks = 0;
                              let courseCount = 0;
                              
                              pageData.forEach(({ credits, grade, marks }) => {
                                totalCredits += credits;
                                totalPoints += getGradePoint(grade) * credits;
                                if (marks) {
                                  totalMarks += marks;
                                  courseCount++;
                                }
                              });
                              
                              const termGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
                              const avgMarks = courseCount > 0 ? (totalMarks / courseCount).toFixed(2) : 'N/A';
                              
                              return (
                                <Table.Summary.Row>
                                  <Table.Summary.Cell index={0} colSpan={2}>
                                    <strong>Term Summary</strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={2} align="center">
                                    <strong>{totalCredits}</strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3}>
                                    <strong>Avg Marks:</strong> {avgMarks}
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={4} align="right">
                                    <strong>Term GPA:</strong>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={5} align="center" colSpan={2}>
                                    <strong>{termGPA}</strong>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              );
                            }}
                          />
                        </Panel>
                      );
                    })}
                  </Collapse>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                <p>This is an official transcript of Shivaji University</p>
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Degree Progress Tab Content */}
        {activeTab === 'degreeProgress' && (
          <div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">{degreeRequirements.program}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Degree Progress Summary</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <Tooltip title="Total program completion">
                    <Progress 
                      type="circle" 
                      percent={Math.round((degreeRequirements.completedCredits / degreeRequirements.totalCreditsRequired) * 100)} 
                      width={80} 
                    />
                  </Tooltip>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">{degreeRequirements.completedCredits}/{degreeRequirements.totalCreditsRequired}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Credits Completed</div>
                  </div>
                </div>
              </div>
              
              <Collapse 
                defaultActiveKey={['Core Computer Science']} 
                onChange={(key) => setExpandedCategory(Array.isArray(key) ? key[0] : key)}
              >
                {degreeRequirements.requirements.map(category => (
                  <Panel
                    key={category.category}
                    header={
                      <div className="flex justify-between items-center w-full">
                        <div className="font-semibold">{category.category}</div>
                        <div className="flex items-center">
                          <Progress 
                            percent={Math.round((category.completed / category.required) * 100)} 
                            size="small" 
                            style={{ width: 120, marginRight: 16 }} 
                          />
                          <span>{category.completed}/{category.required} credits</span>
                        </div>
                      </div>
                    }
                  >
                    <Table
                      dataSource={category.courses}
                      pagination={false}
                      rowKey="id"
                      columns={[
                        {
                          title: 'Course',
                          dataIndex: 'id',
                          key: 'id',
                          render: (id) => <Tag color="blue">{id}</Tag>
                        },
                        {
                          title: 'Course Name',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Credits',
                          dataIndex: 'credits',
                          key: 'credits',
                          align: 'center',
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          align: 'center',
                          render: (status) => {
                            let color, icon, text;
                            
                            switch (status) {
                              case 'completed':
                                color = 'green';
                                icon = <CheckCircle size={14} />;
                                text = 'Completed';
                                break;
                              case 'in_progress':
                                color = 'blue';
                                icon = <Clock size={14} />;
                                text = 'In Progress';
                                break;
                              case 'planned':
                                color = 'orange';
                                icon = <Calendar size={14} />;
                                text = 'Planned';
                                break;
                              default:
                                color = 'default';
                                text = 'Not Started';
                            }
                            
                            return <Tag color={color} icon={icon}>{text}</Tag>;
                          }
                        }
                      ]}
                    />
                  </Panel>
                ))}
              </Collapse>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Graduation Requirements">
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Minimum GPA Requirement</span>
                    <Tag color={parseFloat(calculateCumulativeGPA()) >= 5.0 ? 'green' : 'red'}>
                      {parseFloat(calculateCumulativeGPA()) >= 5.0 ? 'Met' : 'Not Met'} (5.0 Required)
                    </Tag>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Total Credits Requirement</span>
                    <Tag color={calculateTotalCredits() >= degreeRequirements.totalCreditsRequired ? 'green' : 'blue'}>
                      {calculateTotalCredits()}/{degreeRequirements.totalCreditsRequired} Credits
                    </Tag>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Core Courses Requirement</span>
                    <Tag color="orange">In Progress</Tag>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Residency Requirement</span>
                    <Tag color="green">Met (30 Credits Required)</Tag>
                  </li>
                </ul>
              </Card>
              
              <Card title="Program Completion Estimate">
                <div className="flex justify-center mb-4">
                  <Progress 
                    type="dashboard" 
                    percent={Math.round((degreeRequirements.completedCredits / degreeRequirements.totalCreditsRequired) * 100)}
                    format={percent => `${percent}%`}
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-semibold">Estimated graduation date: May 2025</p>
                  <p className="text-gray-600 dark:text-gray-400">Based on your current progress and course load</p>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Alerts Tab Content */}
        {activeTab === 'alerts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Academic Events</h2>
              
              <Button
                type="primary"
                icon={<Calendar size={16} />}
                onClick={() => window.open('/schedule', '_blank')}
              >
                View Calendar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {alerts.length === 0 ? (
                <Card>
                  <Empty description="No upcoming academic alerts at this time" />
                </Card>
              ) : (
                alerts.map(alert => (
                  <Card 
                    key={alert.id} 
                    className="alert-card"
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  >
                    <div className="flex">
                      <div className="mr-4 pt-1">
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{alert.title}</h4>
                            {alert.course && (
                              <div className="flex items-center mt-1">
                                <Tag color="blue">{alert.course}</Tag>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{alert.courseName}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 md:mt-0 flex items-center">
                            <div className={`text-sm px-3 py-1 rounded-full ${getAlertUrgencyClass(alert.date)}`}>
                              {getDayDifference(alert.date) < 0 
                                ? 'Past event'
                                : getDayDifference(alert.date) === 0
                                  ? 'Today'
                                  : `${getDayDifference(alert.date)} days remaining`
                              }
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                          {formatDate(alert.date)}
                          {alert.location && ` • ${alert.location}`}
                        </p>
                        
                        {expandedAlert === alert.id && (
                          <div className="mt-4 pt-4 border-t">
                            <p>{alert.description}</p>
                            
                            {alert.type === 'exam' && (
                              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                <h5 className="font-semibold mb-1">Exam Details</h5>
                                <ul className="list-disc pl-5">
                                  <li>Duration: 2 hours</li>
                                  <li>Format: Closed book, multiple choice and short answer</li>
                                  <li>Bring: Student ID, calculator, pencils</li>
                                </ul>
                              </div>
                            )}
                            
                            {alert.type === 'enrollment' && (
                              <div className="mt-4">
                                <Button type="primary" icon={<ExternalLink size={14} />}>
                                  View Registration Portal
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicRecords; 