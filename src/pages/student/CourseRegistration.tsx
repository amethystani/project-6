import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Tooltip, Modal, Input, Select, Badge, Divider } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { 
  BookOpen, 
  Clock, 
  Filter,
  Search,
  Calendar,
  Info,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Course {
  id: number;
  course_code: string;
  title: string;
  description: string;
  credits: number;
  department: string;
  prerequisites: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrollment_date: string;
  status: string;
  course: Course;
}

const { Search: SearchInput } = Input;
const { Option } = Select;

const CourseRegistration: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [creditsFilter, setCreditsFilter] = useState<number | null>(null);
  const [courseDetailsVisible, setCourseDetailsVisible] = useState(false);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const { token } = useAuth();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // In a real implementation, replace this with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses?is_active=true`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // Mock data
      const mockCourses = [
        {
          id: 1,
          course_code: "CS101",
          title: "Introduction to Computer Science",
          description: "An introductory course covering the fundamentals of computer science, programming concepts, and problem-solving techniques.",
          credits: 3,
          department: "Computer Science",
          prerequisites: "None",
          capacity: 30,
          is_active: true,
          created_at: "2023-01-15T10:00:00",
          created_by: 1
        },
        {
          id: 2,
          course_code: "MATH201",
          title: "Calculus I",
          description: "Introduction to differential and integral calculus of functions of one variable.",
          credits: 4,
          department: "Mathematics",
          prerequisites: "High school algebra and trigonometry",
          capacity: 25,
          is_active: true,
          created_at: "2023-01-16T10:00:00",
          created_by: 2
        },
        {
          id: 3,
          course_code: "ENG102",
          title: "Academic Writing",
          description: "Development of academic writing skills including research, critical analysis, and argumentation.",
          credits: 3,
          department: "English",
          prerequisites: "ENG101",
          capacity: 20,
          is_active: true,
          created_at: "2023-01-17T10:00:00",
          created_by: 3
        },
        {
          id: 4,
          course_code: "PHYS101",
          title: "Physics I: Mechanics",
          description: "Introduction to Newtonian mechanics, including kinematics, dynamics, energy, and momentum.",
          credits: 4,
          department: "Physics",
          prerequisites: "MATH201 (co-requisite)",
          capacity: 24,
          is_active: true,
          created_at: "2023-01-18T10:00:00",
          created_by: 4
        },
        {
          id: 5,
          course_code: "CS201",
          title: "Data Structures",
          description: "Study of data structures and algorithms for manipulating them efficiently.",
          credits: 3,
          department: "Computer Science",
          prerequisites: "CS101",
          capacity: 28,
          is_active: true,
          created_at: "2023-01-19T10:00:00",
          created_by: 1
        },
        {
          id: 6,
          course_code: "BIO101",
          title: "Introduction to Biology",
          description: "Overview of fundamental principles of biology, including cell structure, genetics, and evolution.",
          credits: 4,
          department: "Biology",
          prerequisites: "None",
          capacity: 30,
          is_active: true,
          created_at: "2023-01-20T10:00:00",
          created_by: 5
        },
        {
          id: 7,
          course_code: "PSYCH101",
          title: "Introduction to Psychology",
          description: "Survey of the basic principles and research findings in psychology.",
          credits: 3,
          department: "Psychology",
          prerequisites: "None",
          capacity: 35,
          is_active: true,
          created_at: "2023-01-21T10:00:00",
          created_by: 6
        },
        {
          id: 8,
          course_code: "CHEM101",
          title: "General Chemistry",
          description: "Introduction to the principles of chemistry, including atomic structure, bonding, and chemical reactions.",
          credits: 4,
          department: "Chemistry",
          prerequisites: "None",
          capacity: 24,
          is_active: true,
          created_at: "2023-01-22T10:00:00",
          created_by: 7
        }
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to fetch available courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setEnrollmentLoading(true);
    try {
      // In a real implementation, replace this with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // Mock data
      const mockEnrollments = [
        {
          id: 1,
          student_id: 1,
          course_id: 1,
          enrollment_date: "2023-04-01T09:00:00",
          status: "enrolled",
          course: {
            id: 1,
            course_code: "CS101",
            title: "Introduction to Computer Science",
            description: "An introductory course covering the fundamentals of computer science, programming concepts, and problem-solving techniques.",
            credits: 3,
            department: "Computer Science",
            prerequisites: "None",
            capacity: 30,
            is_active: true,
            created_at: "2023-01-15T10:00:00",
            created_by: 1
          }
        },
        {
          id: 2,
          student_id: 1,
          course_id: 2,
          enrollment_date: "2023-04-02T10:00:00",
          status: "enrolled",
          course: {
            id: 2,
            course_code: "MATH201",
            title: "Calculus I",
            description: "Introduction to differential and integral calculus of functions of one variable.",
            credits: 4,
            department: "Mathematics",
            prerequisites: "High school algebra and trigonometry",
            capacity: 25,
            is_active: true,
            created_at: "2023-01-16T10:00:00",
            created_by: 2
          }
        }
      ];
      setEnrollments(mockEnrollments);
      
      // Calculate total credits
      const total = mockEnrollments.reduce((sum, enrollment) => 
        sum + enrollment.course.credits, 0);
      setTotalCredits(total);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Failed to fetch your enrollments');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [token]);

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setConfirmModalVisible(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse) return;

    try {
      // In a real implementation, replace with actual API call
      // await axios.post(
      //   `${import.meta.env.VITE_API_URL}/api/enrollments`,
      //   { course_id: selectedCourse.id },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // Mock enrollment
      const newEnrollment = {
        id: enrollments.length + 1,
        student_id: 1,
        course_id: selectedCourse.id,
        enrollment_date: new Date().toISOString(),
        status: "enrolled",
        course: selectedCourse
      };
      
      setEnrollments([...enrollments, newEnrollment]);
      setTotalCredits(totalCredits + selectedCourse.credits);
      
      message.success(`Successfully enrolled in ${selectedCourse.course_code}: ${selectedCourse.title}`);
      setConfirmModalVisible(false);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      message.error(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const handleShowDetails = (course: Course) => {
    setCourseDetail(course);
    setCourseDetailsVisible(true);
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(courses.map(course => course.department))).sort();

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.course_code.toLowerCase().includes(searchText.toLowerCase()) ||
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDepartment = departmentFilter ? course.department === departmentFilter : true;
    const matchesCredits = creditsFilter ? course.credits === creditsFilter : true;
    
    return matchesSearch && matchesDepartment && matchesCredits;
  });

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
      render: (text: string, record: Course) => (
        <a onClick={() => handleShowDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <Badge count={credits} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Prerequisites',
      dataIndex: 'prerequisites',
      key: 'prerequisites',
      render: (prerequisites: string) => prerequisites || 'None',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => {
        const enrolled = isEnrolled(record.id);
        return (
          <div className="flex space-x-2">
            <Button 
              type={enrolled ? "default" : "primary"}
              disabled={enrolled}
              onClick={() => !enrolled && handleEnrollClick(record)}
              icon={enrolled ? <CheckCircle size={16} /> : undefined}
            >
              {enrolled ? "Enrolled" : "Enroll"}
            </Button>
            <Button 
              type="default" 
              onClick={() => handleShowDetails(record)}
              icon={<Info size={16} />}
            >
              Details
            </Button>
          </div>
        );
      },
    },
  ];

  const enrollmentColumns = [
    {
      title: 'Course Code',
      dataIndex: ['course', 'course_code'],
      key: 'course_code',
    },
    {
      title: 'Title',
      dataIndex: ['course', 'title'],
      key: 'title',
    },
    {
      title: 'Department',
      dataIndex: ['course', 'department'],
      key: 'department',
      render: (department: string) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
      render: (credits: number) => (
        <Badge count={credits} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Enrollment Date',
      dataIndex: 'enrollment_date',
      key: 'enrollment_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'enrolled' ? 'green' : 'blue'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Registration</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Spring 2023 Semester
            </span>
          </div>
        </div>
      </div>
      
      {/* Current registration summary */}
      <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Registration Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currently enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white dark:bg-gray-800 py-2 px-6 rounded-full shadow-sm">
            <span className="text-gray-600 dark:text-gray-400 mr-2">Total Credits:</span>
            <span className="text-xl font-bold text-primary">{totalCredits}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Enrollments</h2>
          <Button 
            type="default" 
            icon={<Clock size={16} />}
            onClick={fetchEnrollments}
            loading={enrollmentLoading}
          >
            Refresh
          </Button>
        </div>
        <Card>
          <Table 
            dataSource={enrollments} 
            columns={enrollmentColumns} 
            rowKey="id"
            loading={enrollmentLoading}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "You're not enrolled in any courses yet" }}
          />
        </Card>
      </div>
      
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Courses</h2>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <SearchInput
              placeholder="Search courses"
              style={{ width: 200 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<Search size={16} className="text-gray-400" />}
            />
            <Select
              placeholder="Department"
              style={{ width: 150 }}
              value={departmentFilter || undefined}
              onChange={value => setDepartmentFilter(value)}
              allowClear
              onClear={() => setDepartmentFilter('')}
            >
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
            <Select
              placeholder="Credits"
              style={{ width: 120 }}
              value={creditsFilter || undefined}
              onChange={value => setCreditsFilter(value)}
              allowClear
              onClear={() => setCreditsFilter(null)}
            >
              <Option value={3}>3 Credits</Option>
              <Option value={4}>4 Credits</Option>
            </Select>
            <Button 
              type="default" 
              icon={<Filter size={16} />}
              onClick={() => {
                setSearchText('');
                setDepartmentFilter('');
                setCreditsFilter(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <Card>
          <Table 
            dataSource={filteredCourses} 
            columns={columns} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "No courses match your search criteria" }}
          />
        </Card>
      </div>
      
      {/* Enrollment Confirmation Modal */}
      <Modal
        title="Confirm Enrollment"
        open={confirmModalVisible}
        onOk={handleConfirmEnroll}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Enroll"
        cancelText="Cancel"
      >
        <div className="py-4">
          <AlertCircle size={40} className="text-primary mx-auto mb-4" />
          <p className="text-center mb-4">Are you sure you want to enroll in this course?</p>
          
          {selectedCourse && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{selectedCourse.course_code}</span>
                <Badge count={selectedCourse.credits} style={{ backgroundColor: '#52c41a' }} />
              </div>
              <p className="font-semibold mb-2">{selectedCourse.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedCourse.description}</p>
              <div className="flex justify-between items-center">
                <Tag color="blue">{selectedCourse.department}</Tag>
                <span className="text-sm">Prerequisites: {selectedCourse.prerequisites || 'None'}</span>
              </div>
            </div>
          )}
          
          <Divider />
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <InfoIcon size={16} className="inline mr-1" />
              This will add the course to your schedule for the current semester.
            </p>
            <p className="mt-2">
              <InfoIcon size={16} className="inline mr-1" />
              You can drop the course within the first two weeks without penalty.
            </p>
          </div>
        </div>
      </Modal>
      
      {/* Course Details Modal */}
      <Modal
        title="Course Details"
        open={courseDetailsVisible}
        onCancel={() => setCourseDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCourseDetailsVisible(false)}>
            Close
          </Button>,
          courseDetail && !isEnrolled(courseDetail.id) && (
            <Button 
              key="enroll" 
              type="primary"
              onClick={() => {
                setCourseDetailsVisible(false);
                handleEnrollClick(courseDetail);
              }}
            >
              Enroll Now
            </Button>
          )
        ]}
        width={600}
      >
        {courseDetail && (
          <div className="py-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{courseDetail.course_code}</h3>
                <h4 className="text-xl">{courseDetail.title}</h4>
              </div>
              <div className="flex flex-col items-end">
                <Badge count={courseDetail.credits} style={{ backgroundColor: '#52c41a' }} />
                <Tag color="blue" className="mt-2">{courseDetail.department}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Description</h5>
              <p>{courseDetail.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Prerequisites</h5>
                <p>{courseDetail.prerequisites || 'None'}</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Class Capacity</h5>
                <p>{courseDetail.capacity} students</p>
              </div>
            </div>
            
            <Divider />
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
              <h5 className="font-semibold mb-2">Registration Status</h5>
              {isEnrolled(courseDetail.id) ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={20} className="mr-2" />
                  <span>You are currently enrolled in this course</span>
                </div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <Info size={20} className="mr-2" />
                  <span>You are not enrolled in this course</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Info Icon component for the modal
const InfoIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default CourseRegistration; 