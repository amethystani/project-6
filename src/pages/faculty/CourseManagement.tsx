import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Calendar, 
  Users, 
  FileText, 
  Bell, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Button, Form, Input, Modal, Select, Table, Tag, InputNumber, message, Alert, Tabs, Card, Badge, Tooltip, Divider } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { Link } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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

interface CurrentCourse {
  id: number;
  course_code: string;
  title: string;
  students: number;
  schedule: string;
  room: string;
  semester: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface CourseApproval {
  id: number;
  course_id: number;
  course: Course;
  requested_by: number;
  approved_by: number | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  requested_at: string;
  updated_at: string;
}

// Mock data for current courses
const mockCurrentCourses: CurrentCourse[] = [
  {
    id: 1,
    course_code: 'CS101',
    title: 'Introduction to Programming',
    students: 32,
    schedule: 'Mon, Wed 9:00-10:30 AM',
    room: 'Room 201',
    semester: 'Spring 2024',
    status: 'active'
  },
  {
    id: 2,
    course_code: 'CS305',
    title: 'Data Structures and Algorithms',
    students: 28,
    schedule: 'Tue, Thu 1:00-2:30 PM',
    room: 'Room 105',
    semester: 'Spring 2024',
    status: 'active'
  },
  {
    id: 3,
    course_code: 'CS401',
    title: 'Advanced Database Systems',
    students: 22,
    schedule: 'Mon, Wed 2:00-3:30 PM',
    room: 'Room 405',
    semester: 'Spring 2024',
    status: 'active'
  }
];

const CourseManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<CurrentCourse[]>(mockCurrentCourses);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const [form] = Form.useForm();

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // For a real implementation, this would fetch courses assigned to this faculty member
      // Here we're using mock data
      setFacultyCourses(mockCurrentCourses);
      
      // No need to fetch course approvals anymore
      // Use a hardcoded API URL if the environment variable isn't available
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Fetch course requests made by this faculty
      // const response = await axios.get(`${apiUrl}/api/courses/approvals`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // if (response.data.status === 'success') {
      //   setCourseApprovals(response.data.data);
      // } else {
      //   message.error('Failed to fetch course data');
      // }
    } catch (error) {
      console.error('Error fetching course data:', error);
      message.error('Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [token]);

  const showModal = () => {
    console.log('Opening faculty course request modal');
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Make sure credits and capacity are numbers
      const formattedValues = {
        ...values,
        credits: Number(values.credits),
        capacity: Number(values.capacity || 30)
      };

      console.log('Submitting form with values:', formattedValues);

      // Use a hardcoded API URL if the environment variable isn't available
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/api/courses/`;
      
      console.log('Submitting to endpoint:', endpoint);
      
      const response = await axios.post(endpoint, formattedValues, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.status === 'success') {
        message.success('Course created successfully and is pending approval');
        setIsModalVisible(false);
        form.resetFields();
        fetchCourseData();
      } else {
        message.error(response.data.message || 'Failed to create course');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.data && error.response.data.message) {
          message.error(error.response.data.message);
        } else {
          message.error(`Request failed with status ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received, request was:', error.request);
        message.error('No response received from server. Please check if the backend is running.');
      } else {
        message.error('Failed to create course: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'approved':
        return <Tag color="green">Approved</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getCourseStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'upcoming':
        return <Tag color="blue">Upcoming</Tag>;
      case 'completed':
        return <Tag color="gray">Completed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const currentCoursesColumns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      render: (students: number) => (
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 text-blue-500" />
          {students}
        </div>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          {schedule}
        </div>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getCourseStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: CurrentCourse) => (
        <div className="flex space-x-2">
          <Tooltip title="Manage Course Materials">
            <Button type="text" icon={<FileText className="h-4 w-4" />} />
          </Tooltip>
          <Tooltip title="Manage Grades">
            <Link to="/dashboard/grade-entry">
              <Button type="text" icon={<Edit className="h-4 w-4" />} />
            </Link>
          </Tooltip>
          <Tooltip title="View Analytics">
            <Link to="/dashboard/faculty-analytics">
              <Button type="text" icon={<Book className="h-4 w-4" />} />
            </Link>
          </Tooltip>
        </div>
      ),
    },
  ];

  const requestColumns = [
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
    },
    {
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
      render: (comments: string) => comments || 'No comments',
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <Book className="mr-2 h-6 w-6 text-primary" />
            Course Management
          </h1>
        </div>
        <Button 
          type="default" 
          icon={<MessageSquare size={16} className="mr-1" />}
          size="large"
          onClick={() => window.location.href = 'mailto:department.head@university.edu?subject=New Course Request'}
        >
          Contact Department Head
        </Button>
      </div>

      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-700 flex items-center">
          <Book className="mr-2 h-5 w-5" />
          As a faculty member, you can teach courses assigned to you by your department. New course proposals must be submitted directly to your department head via email.
        </p>
        <p className="text-blue-700 flex items-center mt-2">
          <MessageSquare className="mr-2 h-5 w-5" />
          Please contact your department head with course details including code, title, description, and justification for any new course requests.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Courses You're Teaching</h2>
        
        {facultyCourses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">You are not currently teaching any courses.</p>
            <p className="text-gray-500">Contact your department head to request new teaching assignments.</p>
          </div>
        ) : (
          <Table 
            dataSource={facultyCourses} 
            columns={currentCoursesColumns} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        )}
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Quick Links" className="shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <Link to="/dashboard/grade-entry" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowRight className="h-4 w-4 mr-2" /> Grade Entry
              </Link>
              <Link to="/dashboard/faculty-analytics" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowRight className="h-4 w-4 mr-2" /> Course Analytics
              </Link>
              <Link to="/dashboard/faculty-schedule" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowRight className="h-4 w-4 mr-2" /> Teaching Schedule
              </Link>
            </div>
          </Card>
          
          <Card title="Teaching Stats" className="shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span>Total Courses:</span>
                <span className="font-semibold">{facultyCourses.length}</span>
              </p>
              <p className="flex justify-between">
                <span>Total Students:</span>
                <span className="font-semibold">{facultyCourses.reduce((sum, course) => sum + course.students, 0)}</span>
              </p>
              <p className="flex justify-between">
                <span>Active Courses:</span>
                <span className="font-semibold">{facultyCourses.filter(c => c.status === 'active').length}</span>
              </p>
            </div>
          </Card>
          
          <Card title="Request New Course" className="shadow-sm hover:shadow-md transition-shadow">
            <p className="mb-4 text-gray-600">Need to teach a new course? Contact your department head directly via email with your proposal.</p>
            <Button 
              type="default" 
              icon={<MessageSquare className="h-4 w-4 mr-1" />}
              onClick={() => window.location.href = 'mailto:department.head@university.edu?subject=New Course Request&body=Dear Department Head,%0D%0A%0D%0AI would like to request a new course with the following details:%0D%0A%0D%0ACourse Code:%0D%0ATitle:%0D%0ADescription:%0D%0ACredits:%0D%0APrerequisites:%0D%0AJustification:%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ARegards,%0D%0A[Your Name]'}
            >
              Email Department Head
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement; 