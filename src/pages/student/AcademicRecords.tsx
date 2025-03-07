import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

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
        status: 'in_progress'
      },
      {
        id: 'MATH201',
        name: 'Linear Algebra',
        grade: 'A-',
        credits: 4,
        instructor: 'Dr. Katherine Johnson',
        status: 'in_progress'
      },
      {
        id: 'PHYS101',
        name: 'Physics I: Mechanics',
        grade: 'B+',
        credits: 4,
        instructor: 'Dr. Richard Feynman',
        status: 'in_progress'
      },
      {
        id: 'ENG102',
        name: 'Academic Writing',
        grade: 'A',
        credits: 3,
        instructor: 'Prof. Maya Angelou',
        status: 'in_progress'
      }
    ]
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
        status: 'completed'
      },
      {
        id: 'ENG101',
        name: 'Composition',
        grade: 'B+',
        credits: 3,
        instructor: 'Prof. Ernest Hemingway',
        status: 'completed'
      },
      {
        id: 'HIST101',
        name: 'World History',
        grade: 'A-',
        credits: 3,
        instructor: 'Dr. Howard Zinn',
        status: 'completed'
      },
      {
        id: 'CHEM101',
        name: 'General Chemistry',
        grade: 'B',
        credits: 4,
        instructor: 'Dr. Marie Curie',
        status: 'completed'
      },
      {
        id: 'ART101',
        name: 'Art Appreciation',
        grade: 'A',
        credits: 2,
        instructor: 'Prof. Frida Kahlo',
        status: 'completed'
      }
    ]
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
        status: 'completed'
      },
      {
        id: 'SOC101',
        name: 'Introduction to Sociology',
        grade: 'A',
        credits: 3,
        instructor: 'Prof. Max Weber',
        status: 'completed'
      },
      {
        id: 'PSYCH101',
        name: 'Introduction to Psychology',
        grade: 'A-',
        credits: 3,
        instructor: 'Dr. Sigmund Freud',
        status: 'completed'
      },
      {
        id: 'ECON101',
        name: 'Principles of Economics',
        grade: 'B',
        credits: 4,
        instructor: 'Dr. Adam Smith',
        status: 'completed'
      }
    ]
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

// GPA calculation helper
const getGradePoint = (grade: string) => {
  switch (grade) {
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'C-': return 1.7;
    case 'D+': return 1.3;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
};

const AcademicRecords = () => {
  const [terms, setTerms] = useState(ACADEMIC_TERMS);
  const [alerts, setAlerts] = useState(UPCOMING_ALERTS);
  const [expandedTerm, setExpandedTerm] = useState<string | null>('term4'); // Default to current term
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  
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
  
  // Calculate total credits earned
  const calculateTotalCredits = () => {
    return terms.reduce((sum, term) => 
      term.status === 'completed' 
        ? sum + term.credits 
        : sum, 
      0
    );
  };
  
  // Determine progress status
  const getProgressStatus = (term: typeof ACADEMIC_TERMS[0]) => {
    const totalCompletedCredits = calculateTotalCredits();
    const creditsNeededForGraduation = 120; // Example value
    const progress = (totalCompletedCredits / creditsNeededForGraduation) * 100;
    
    return {
      percentage: Math.min(progress, 100).toFixed(1),
      remaining: creditsNeededForGraduation - totalCompletedCredits
    };
  };
  
  // Get day difference for alerts
  const getDayDifference = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get alert urgency class
  const getAlertUrgencyClass = (dateString: string) => {
    const dayDiff = getDayDifference(dateString);
    
    if (dayDiff < 0) return 'text-gray-500'; // Past
    if (dayDiff === 0) return 'text-red-600'; // Today
    if (dayDiff <= 3) return 'text-amber-600'; // Soon
    return 'text-blue-600'; // Future
  };
  
  // Get alert type icon
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <FileText className="text-blue-600" />;
      case 'project':
        return <Bookmark className="text-green-600" />;
      case 'faculty':
        return <Bell className="text-purple-600" />;
      case 'enrollment':
        return <Calendar className="text-amber-600" />;
      default:
        return <AlertTriangle className="text-red-600" />;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Academic Records</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center mb-2">
            <GraduationCap className="text-primary mr-2" size={20} />
            <h2 className="text-lg font-semibold">Cumulative GPA</h2>
          </div>
          <p className="text-3xl font-bold text-primary">{calculateCumulativeGPA()}</p>
          <p className="text-sm text-gray-500 mt-1">out of 4.0 scale</p>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center mb-2">
            <Award className="text-amber-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Credits Earned</h2>
          </div>
          <p className="text-3xl font-bold text-amber-500">{calculateTotalCredits()}</p>
          <p className="text-sm text-gray-500 mt-1">total credits completed</p>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center mb-2">
            <BarChart className="text-green-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Degree Progress</h2>
          </div>
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${getProgressStatus(terms[0]).percentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">{getProgressStatus(terms[0]).percentage}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {getProgressStatus(terms[0]).remaining} credits remaining for graduation
          </p>
        </div>
      </div>
      
      {/* Academic Terms and Alerts - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="mr-2" size={20} />
                Academic History
              </h2>
            </div>
            
            <div className="divide-y">
              {terms.map(term => (
                <div key={term.id} className="divide-y">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {expandedTerm === term.id 
                          ? <ChevronDown size={18} className="text-gray-500 mr-1" /> 
                          : <ChevronRight size={18} className="text-gray-500 mr-1" />
                        }
                        <h3 className="font-semibold text-lg">{term.name}</h3>
                        {term.status === 'current' && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {term.credits} Credits
                        </div>
                        <div className="font-semibold text-primary">
                          GPA: {term.gpa.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedTerm === term.id && (
                    <div className="p-4 bg-gray-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left font-semibold text-gray-600">Course</th>
                            <th className="py-2 text-left font-semibold text-gray-600">Title</th>
                            <th className="py-2 text-left font-semibold text-gray-600">Credits</th>
                            <th className="py-2 text-left font-semibold text-gray-600">Grade</th>
                            <th className="py-2 text-left font-semibold text-gray-600">Instructor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {term.courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-100">
                              <td className="py-3 pr-4 font-medium">{course.id}</td>
                              <td className="py-3 pr-4">{course.name}</td>
                              <td className="py-3 pr-4">{course.credits}</td>
                              <td className="py-3 pr-4">
                                <div className={`font-medium ${
                                  course.grade.startsWith('A') 
                                    ? 'text-green-600' 
                                    : course.grade.startsWith('B') 
                                      ? 'text-blue-600' 
                                      : course.grade.startsWith('C') 
                                        ? 'text-amber-600' 
                                        : 'text-red-600'
                                }`}>
                                  {course.status === 'in_progress' 
                                    ? course.grade + ' (IP)' 
                                    : course.grade
                                  }
                                </div>
                              </td>
                              <td className="py-3 pr-4">{course.instructor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border">
            <p><strong>Note:</strong> The academic record shown above is unofficial. For official transcripts, please visit the Registrar's Office or request through your student portal.</p>
          </div>
        </div>
        
        {/* Alerts and Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                Upcoming Events
              </h2>
            </div>
            
            <div className="divide-y">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No upcoming events or alerts
                </div>
              ) : (
                alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="cursor-pointer"
                    onClick={() => setExpandedAlert(
                      expandedAlert === alert.id ? null : alert.id
                    )}
                  >
                    <div className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          {getAlertTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{alert.title}</h3>
                          {alert.course && (
                            <p className="text-sm text-gray-600">
                              {alert.course}: {alert.courseName}
                            </p>
                          )}
                          <div className={`flex items-center mt-1 text-sm ${getAlertUrgencyClass(alert.date)}`}>
                            <Clock size={14} className="mr-1" />
                            <span>
                              {formatDate(alert.date)}
                              {getDayDifference(alert.date) === 0 && (
                                <span className="font-semibold ml-1">(Today)</span>
                              )}
                            </span>
                          </div>
                        </div>
                        {expandedAlert === alert.id 
                          ? <ChevronDown size={18} className="text-gray-400" /> 
                          : <ChevronRight size={18} className="text-gray-400" />
                        }
                      </div>
                      
                      {expandedAlert === alert.id && (
                        <div className="mt-3 pl-12 pb-2 text-sm text-gray-600">
                          <p>{alert.description}</p>
                          {alert.location && (
                            <p className="mt-2">
                              <span className="font-medium">Location:</span> {alert.location}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="mr-2" size={20} />
                Academic Calendar
              </h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">
                    May 25
                  </div>
                  <p className="text-sm">Fall 2023 Registration Opens</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">
                    Jun 10
                  </div>
                  <p className="text-sm">Spring 2023 Final Exams Begin</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">
                    Jun 17
                  </div>
                  <p className="text-sm">Spring 2023 Semester Ends</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">
                    Jul 1
                  </div>
                  <p className="text-sm">Summer Session Begins</p>
                </div>
              </div>
              
              <button className="w-full mt-4 text-center text-primary text-sm hover:underline">
                View Full Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicRecords; 