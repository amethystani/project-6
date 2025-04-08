import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Book, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Filter,
  Plus,
  Download,
  Upload,
  Search,
  ArrowLeft,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserPlus,
  Eye
} from 'lucide-react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  Tabs, 
  Tag, 
  Card, 
  Tooltip,
  Progress,
  Breadcrumb,
  message,
  Avatar,
  Badge,
  Statistic,
  Switch,
  Radio,
  Divider,
  Checkbox
} from 'antd';
import { DownloadOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    course_code: 'CS101',
    title: 'Introduction to Programming',
    semester: 'Spring 2024',
    section: 'A',
    students: 32
  },
  {
    id: 2,
    course_code: 'CS305',
    title: 'Data Structures and Algorithms',
    semester: 'Spring 2024',
    section: 'B',
    students: 28
  },
  {
    id: 3,
    course_code: 'CS401',
    title: 'Advanced Database Systems',
    semester: 'Spring 2024',
    section: 'A',
    students: 22
  }
];

// Mock data for students
const mockStudents = [
  {
    id: 1,
    course_id: 1,
    student_id: 'S1001',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg',
    gender: 'Male',
    major: 'Computer Science',
    year: '2',
    attendance_rate: 95,
    status: 'active',
    group: 'A',
    last_active: '2024-04-05T14:30:00',
    grades: { midterm: 88, quizzes: 92, assignments: 85 }
  },
  {
    id: 2,
    course_id: 1,
    student_id: 'S1002',
    name: 'Emily Johnson',
    email: 'emily.johnson@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg',
    gender: 'Female',
    major: 'Computer Science',
    year: '2',
    attendance_rate: 100,
    status: 'active',
    group: 'A',
    last_active: '2024-04-05T16:45:00',
    grades: { midterm: 94, quizzes: 90, assignments: 92 }
  },
  {
    id: 3,
    course_id: 1,
    student_id: 'S1003',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/men/3.jpg',
    gender: 'Male',
    major: 'Computer Engineering',
    year: '2',
    attendance_rate: 88,
    status: 'active',
    group: 'B',
    last_active: '2024-04-04T09:15:00',
    grades: { midterm: 78, quizzes: 82, assignments: 80 }
  },
  {
    id: 4,
    course_id: 1,
    student_id: 'S1004',
    name: 'Jessica Thompson',
    email: 'jessica.thompson@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/women/4.jpg',
    gender: 'Female',
    major: 'Information Systems',
    year: '3',
    attendance_rate: 92,
    status: 'active',
    group: 'B',
    last_active: '2024-04-05T11:20:00',
    grades: { midterm: 86, quizzes: 88, assignments: 90 }
  },
  {
    id: 5,
    course_id: 2,
    student_id: 'S1005',
    name: 'David Wilson',
    email: 'david.wilson@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/men/5.jpg',
    gender: 'Male',
    major: 'Computer Science',
    year: '3',
    attendance_rate: 85,
    status: 'active',
    group: 'A',
    last_active: '2024-04-05T13:10:00',
    grades: { midterm: 92, quizzes: 88, assignments: 85 }
  },
  {
    id: 6,
    course_id: 2,
    student_id: 'S1006',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/women/6.jpg',
    gender: 'Female',
    major: 'Mathematics',
    year: '3',
    attendance_rate: 98,
    status: 'active',
    group: 'A',
    last_active: '2024-04-05T15:30:00',
    grades: { midterm: 95, quizzes: 96, assignments: 94 }
  },
  {
    id: 7,
    course_id: 3,
    student_id: 'S1007',
    name: 'James Taylor',
    email: 'james.taylor@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/men/7.jpg',
    gender: 'Male',
    major: 'Data Science',
    year: '4',
    attendance_rate: 90,
    status: 'active',
    group: 'A',
    last_active: '2024-04-05T10:45:00',
    grades: { midterm: 88, quizzes: 85, assignments: 90 }
  },
  {
    id: 8,
    course_id: 3,
    student_id: 'S1008',
    name: 'Amanda Lee',
    email: 'amanda.lee@university.edu',
    profile_picture: 'https://randomuser.me/api/portraits/women/8.jpg',
    gender: 'Female',
    major: 'Computer Science',
    year: '4',
    attendance_rate: 94,
    status: 'active',
    group: 'B',
    last_active: '2024-04-04T16:20:00',
    grades: { midterm: 91, quizzes: 93, assignments: 92 }
  }
];

// Group categories
const studentGroups = ['A', 'B', 'C', 'D', 'E', 'F'];

const CourseRoster = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState(mockStudents);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [groupManagementModalVisible, setGroupManagementModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<React.Key[]>([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [groupForm] = Form.useForm();
  const { token } = useAuth();

  // Use Effect to initialize
  useEffect(() => {
    // In a real implementation, we would fetch students from the API
    // Here we're just using mock data
    
    if (selectedCourse) {
      // Filter students by selected course
      setStudents(mockStudents.filter(student => student.course_id === selectedCourse));
    } else {
      setStudents(mockStudents);
    }
  }, [selectedCourse]);

  // Filter students based on search text and active tab
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchText.toLowerCase()) || 
      student.email.toLowerCase().includes(searchText.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchText.toLowerCase()) || 
      student.major.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'group-a' && student.group === 'A') || 
      (activeTab === 'group-b' && student.group === 'B') ||
      (activeTab === 'high-attendance' && student.attendance_rate >= 90);
    
    return matchesSearch && matchesTab;
  });

  // Get status tag
  const getAttendanceTag = (rate: number) => {
    if (rate >= 90) {
      return <Tag color="green">Excellent ({rate}%)</Tag>;
    } else if (rate >= 80) {
      return <Tag color="blue">Good ({rate}%)</Tag>;
    } else if (rate >= 70) {
      return <Tag color="orange">Average ({rate}%)</Tag>;
    } else {
      return <Tag color="red">Poor ({rate}%)</Tag>;
    }
  };

  // Function to handle row selection
  const rowSelection = {
    selectedRowKeys: selectedStudents,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedStudents(selectedRowKeys);
    },
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get time since last active
  const getTimeSinceLastActive = (lastActiveDate: string) => {
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  };

  // Handle form submission for adding a student
  const handleAddStudent = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would add a student record via API
      console.log('Submitting form with values:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      message.success('Student added successfully!');
      
      // Close the modal and reset form
      setAddStudentModalVisible(false);
      form.resetFields();
      
      // Add the new student to the list (in a real app, we would fetch the updated list)
      const newStudent = {
        id: Math.max(...students.map(s => s.id)) + 1,
        course_id: values.course_id,
        student_id: values.student_id,
        name: values.name,
        email: values.email,
        profile_picture: 'https://randomuser.me/api/portraits/men/11.jpg', // Default profile picture
        gender: values.gender,
        major: values.major,
        year: values.year,
        attendance_rate: 0, // No attendance yet
        status: 'active',
        group: values.group,
        last_active: new Date().toISOString(),
        grades: { midterm: 0, quizzes: 0, assignments: 0 } // No grades yet
      };
      
      setStudents([...students, newStudent]);
    } catch (error) {
      console.error('Error adding student:', error);
      message.error('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending messages to students
  const handleSendMessage = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would send messages via API
      console.log('Sending message:', values);
      console.log('Selected students:', selectedStudents);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      message.success(`Message sent to ${selectedStudents.length} student(s)!`);
      
      // Close the modal and reset form
      setMessageModalVisible(false);
      messageForm.resetFields();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Handle group management
  const handleGroupUpdate = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would update groups via API
      console.log('Updating groups:', values);
      console.log('Selected students:', selectedStudents);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update student groups
      const updatedStudents = students.map(student => 
        selectedStudents.includes(student.id) ? { ...student, group: values.group } : student
      );
      
      setStudents(updatedStudents);
      
      // Show success message
      message.success(`Group updated for ${selectedStudents.length} student(s)!`);
      
      // Close the modal and reset form
      setGroupManagementModalVisible(false);
      groupForm.resetFields();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error updating groups:', error);
      message.error('Failed to update groups');
    } finally {
      setLoading(false);
    }
  };

  // View student details
  const viewStudentDetails = (student: any) => {
    setSelectedStudentDetails(student);
    setDetailModalVisible(true);
  };

  // Column definition for the students table
  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (record: any) => (
        <div className="flex items-center cursor-pointer" onClick={() => viewStudentDetails(record)}>
          <Avatar src={record.profile_picture} size={40} />
          <div className="ml-3">
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground">{record.student_id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: any) => (
        <div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
            <a href={`mailto:${record.email}`} className="hover:underline">{record.email}</a>
          </div>
        </div>
      ),
    },
    {
      title: 'Academic Info',
      key: 'academic',
      render: (record: any) => (
        <div>
          <div className="text-sm">{record.major}</div>
          <div className="text-sm text-muted-foreground">Year {record.year}</div>
        </div>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => (
        <Tag color="blue">{group}</Tag>
      ),
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance_rate',
      key: 'attendance',
      render: (rate: number) => getAttendanceTag(rate),
    },
    {
      title: 'Last Active',
      dataIndex: 'last_active',
      key: 'last_active',
      render: (date: string) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
          {getTimeSinceLastActive(date)}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex space-x-2">
          <Tooltip title="View Details">
            <Button type="text" icon={<User className="h-4 w-4" />} onClick={() => viewStudentDetails(record)} />
          </Tooltip>
          <Tooltip title="Send Message">
            <Button 
              type="text" 
              icon={<MessageSquare className="h-4 w-4" />} 
              onClick={() => {
                setSelectedStudents([record.id]);
                setMessageModalVisible(true);
              }} 
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // The main dashboard layout
  return (
    <div className="p-4 md:p-6">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item>
            <Link to="/dashboard" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/course-management">Course Management</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Student Roster</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="h-6 w-6 mr-2 text-primary" />
            Student Roster
          </h1>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setAddStudentModalVisible(true)}
            >
              Add Student
            </Button>
            <Button
              icon={<Users className="h-4 w-4" />}
              disabled={selectedStudents.length === 0}
              onClick={() => setGroupManagementModalVisible(true)}
            >
              Manage Groups
            </Button>
            <Button
              icon={<MessageSquare className="h-4 w-4" />}
              disabled={selectedStudents.length === 0}
              onClick={() => setMessageModalVisible(true)}
            >
              Message Selected
            </Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Roster
            </Button>
          </div>
        </div>
      </div>
      
      {/* Course selection and search section */}
      <div className="bg-background border border-border p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">Course</label>
            <Select
              placeholder="Select Course"
              className="w-full"
              allowClear
              onChange={(value) => setSelectedCourse(value)}
            >
              {mockCourses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_code}: {course.title} (Section {course.section})
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-2/3">
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search by name, ID, email or major"
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <Statistic 
            title="Total Students" 
            value={students.length} 
            prefix={<Users className="h-5 w-5 text-blue-500" />} 
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic 
            title="Average Attendance" 
            value={Math.round(students.reduce((acc, student) => acc + student.attendance_rate, 0) / students.length)}
            suffix="%" 
            prefix={<UserCheck className="h-5 w-5 text-green-500" />} 
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic 
            title="Students in Group A" 
            value={students.filter(student => student.group === 'A').length}
            prefix={<Users className="h-5 w-5 text-purple-500" />} 
          />
        </Card>
        <Card className="shadow-sm">
          <Statistic 
            title="Students in Group B" 
            value={students.filter(student => student.group === 'B').length}
            prefix={<Users className="h-5 w-5 text-orange-500" />} 
          />
        </Card>
      </div>
      
      {/* Students Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Course Roster</h2>
          <Button icon={<Download className="h-4 w-4" />}>Export to CSV</Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            dataSource={filteredStudents}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        </div>
      </Card>
      
      {/* Add Student Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Add New Student
          </div>
        }
        open={addStudentModalVisible}
        onCancel={() => {
          setAddStudentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStudent}
        >
          <Form.Item
            name="course_id"
            label="Course"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select placeholder="Select Course">
              {mockCourses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_code}: {course.title} (Section {course.section})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="student_id"
            label="Student ID"
            rules={[{ required: true, message: 'Please enter a student ID' }]}
          >
            <Input placeholder="e.g., S1009" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter the student name' }]}
          >
            <Input placeholder="e.g., John Doe" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="e.g., john.doe@university.edu" />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select a gender' }]}
            >
              <Select placeholder="Select Gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="major"
              label="Major"
              rules={[{ required: true, message: 'Please enter a major' }]}
            >
              <Input placeholder="e.g., Computer Science" />
            </Form.Item>
            
            <Form.Item
              name="year"
              label="Year"
              rules={[{ required: true, message: 'Please select a year' }]}
            >
              <Select placeholder="Select Year">
                <Option value="1">Year 1</Option>
                <Option value="2">Year 2</Option>
                <Option value="3">Year 3</Option>
                <Option value="4">Year 4</Option>
                <Option value="5">Year 5+</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="group"
            label="Assign to Group"
            rules={[{ required: true, message: 'Please select a group' }]}
          >
            <Select placeholder="Select Group">
              {studentGroups.map(group => (
                <Option key={group} value={group}>Group {group}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setAddStudentModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Student
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* Group Management Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Manage Student Groups
          </div>
        }
        open={groupManagementModalVisible}
        onCancel={() => {
          setGroupManagementModalVisible(false);
          groupForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <p className="mb-4 text-muted-foreground">
          You have selected {selectedStudents.length} student(s). 
          Choose a group to assign them to.
        </p>
        
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={handleGroupUpdate}
        >
          <Form.Item
            name="group"
            label="Assign to Group"
            rules={[{ required: true, message: 'Please select a group' }]}
          >
            <Select placeholder="Select Group">
              {studentGroups.map(group => (
                <Option key={group} value={group}>Group {group}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setGroupManagementModalVisible(false);
                groupForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Groups
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* Message Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Send Message to Students
          </div>
        }
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <p className="mb-4 text-muted-foreground">
          You are sending a message to {selectedStudents.length} student(s).
        </p>
        
        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleSendMessage}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject' }]}
          >
            <Input placeholder="e.g., Important Announcement" />
          </Form.Item>
          
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea rows={4} placeholder="Enter your message here..." />
          </Form.Item>
          
          <Form.Item
            name="send_email"
            valuePropName="checked"
          >
            <Checkbox>Also send as email</Checkbox>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setMessageModalVisible(false);
                messageForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Message
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* Student Details Modal */}
      {selectedStudentDetails && (
        <Modal
          title={
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Student Details
            </div>
          }
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedStudentDetails(null);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => {
                setDetailModalVisible(false);
                setSelectedStudentDetails(null);
              }}
            >
              Close
            </Button>,
            <Button 
              key="message" 
              type="primary"
              icon={<MessageSquare className="h-4 w-4" />}
              onClick={() => {
                setDetailModalVisible(false);
                setSelectedStudents([selectedStudentDetails.id]);
                setMessageModalVisible(true);
              }}
            >
              Send Message
            </Button>
          ]}
          width={700}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar src={selectedStudentDetails.profile_picture} size={100} />
              <div className="mt-4 space-y-2">
                <Tag color="blue">Group {selectedStudentDetails.group}</Tag>
                {getAttendanceTag(selectedStudentDetails.attendance_rate)}
              </div>
            </div>
            
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">{selectedStudentDetails.name}</h2>
              <p className="text-muted-foreground">{selectedStudentDetails.student_id}</p>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${selectedStudentDetails.email}`} className="hover:underline">
                        {selectedStudentDetails.email}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Academic Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedStudentDetails.major}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Year {selectedStudentDetails.year}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <h3 className="font-medium mb-2">Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Midterm</div>
                  <Progress 
                    percent={selectedStudentDetails.grades.midterm} 
                    format={percent => `${percent}%`}
                    status={selectedStudentDetails.grades.midterm >= 70 ? "normal" : "exception"}
                  />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quizzes</div>
                  <Progress 
                    percent={selectedStudentDetails.grades.quizzes} 
                    format={percent => `${percent}%`}
                    status={selectedStudentDetails.grades.quizzes >= 70 ? "normal" : "exception"}
                  />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Assignments</div>
                  <Progress 
                    percent={selectedStudentDetails.grades.assignments} 
                    format={percent => `${percent}%`}
                    status={selectedStudentDetails.grades.assignments >= 70 ? "normal" : "exception"}
                  />
                </div>
              </div>
              
              <Divider />
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Last Active</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(selectedStudentDetails.last_active)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge 
                    status={selectedStudentDetails.status === 'active' ? 'success' : 'default'} 
                    text={selectedStudentDetails.status === 'active' ? 'Active' : 'Inactive'} 
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseRoster; 