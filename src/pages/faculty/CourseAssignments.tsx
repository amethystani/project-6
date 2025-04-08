import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Book, 
  Users, 
  Calendar, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Tabs, 
  Tag, 
  Card, 
  Tooltip,
  Progress,
  Breadcrumb,
  message,
  InputNumber,
  Radio,
  Switch
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import axios from 'axios';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    course_code: 'CS101',
    title: 'Introduction to Programming',
    semester: 'Spring 2024'
  },
  {
    id: 2,
    course_code: 'CS305',
    title: 'Data Structures and Algorithms',
    semester: 'Spring 2024'
  },
  {
    id: 3,
    course_code: 'CS401',
    title: 'Advanced Database Systems',
    semester: 'Spring 2024'
  }
];

// Mock data for assignments
const mockAssignments = [
  {
    id: 1,
    course_id: 1,
    title: 'Java Basics Exercise',
    description: 'Complete the exercises on Java variables, data types, and basic operations.',
    type: 'exercise',
    points: 10,
    due_date: '2024-04-15T23:59:59',
    release_date: '2024-04-01T08:00:00',
    is_published: true,
    allow_late_submissions: true,
    late_penalty: 10,
    submission_type: 'online',
    status: 'active',
    submissions: 18,
    total_students: 32
  },
  {
    id: 2,
    course_id: 1,
    title: 'Control Flow Programming Assignment',
    description: 'Implement various control flow structures in Java including loops and conditionals.',
    type: 'assignment',
    points: 25,
    due_date: '2024-04-22T23:59:59',
    release_date: '2024-04-08T08:00:00',
    is_published: true,
    allow_late_submissions: true,
    late_penalty: 15,
    submission_type: 'online',
    status: 'active',
    submissions: 5,
    total_students: 32
  },
  {
    id: 3,
    course_id: 1,
    title: 'Object-Oriented Programming Project',
    description: 'Design and implement a simple object-oriented system using proper OOP principles.',
    type: 'project',
    points: 50,
    due_date: '2024-05-10T23:59:59',
    release_date: '2024-04-15T08:00:00',
    is_published: false,
    allow_late_submissions: false,
    late_penalty: 0,
    submission_type: 'online',
    status: 'draft',
    submissions: 0,
    total_students: 32
  },
  {
    id: 4,
    course_id: 2,
    title: 'Array Implementation Quiz',
    description: 'Quiz on array data structures and operations.',
    type: 'quiz',
    points: 15,
    due_date: '2024-04-12T23:59:59',
    release_date: '2024-04-10T08:00:00',
    is_published: true,
    allow_late_submissions: false,
    late_penalty: 0,
    submission_type: 'online',
    status: 'active',
    submissions: 26,
    total_students: 28
  },
  {
    id: 5,
    course_id: 3,
    title: 'SQL Database Design Project',
    description: 'Create a comprehensive database design including tables, relationships, and queries.',
    type: 'project',
    points: 100,
    due_date: '2024-05-20T23:59:59',
    release_date: '2024-04-20T08:00:00',
    is_published: true,
    allow_late_submissions: true,
    late_penalty: 5,
    submission_type: 'online',
    status: 'active',
    submissions: 8,
    total_students: 22
  }
];

// Assignment types configuration
const assignmentTypes = [
  { value: 'assignment', label: 'Assignment', color: 'blue' },
  { value: 'quiz', label: 'Quiz', color: 'green' },
  { value: 'exercise', label: 'Exercise', color: 'cyan' },
  { value: 'project', label: 'Project', color: 'orange' },
  { value: 'exam', label: 'Exam', color: 'red' }
];

// Submission types
const submissionTypes = [
  { value: 'online', label: 'Online Submission' },
  { value: 'file', label: 'File Upload' },
  { value: 'text', label: 'Text Entry' },
  { value: 'external', label: 'External Tool' },
  { value: 'none', label: 'No Submission' }
];

const CourseAssignments = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { token } = useAuth();

  // Use Effect to initialize
  useEffect(() => {
    // In a real implementation, we would fetch assignments from the API
    // Here we're just using mock data
    
    if (selectedCourse) {
      // Filter assignments by selected course
      setAssignments(mockAssignments.filter(assignment => assignment.course_id === selectedCourse));
    } else {
      setAssignments(mockAssignments);
    }
  }, [selectedCourse]);

  // Filter assignments based on search text and active tab
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchText.toLowerCase()) || 
      assignment.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'published' && assignment.is_published) || 
      (activeTab === 'drafts' && !assignment.is_published) ||
      (activeTab === 'active' && assignment.status === 'active');
    
    return matchesSearch && matchesTab;
  });

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

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get status label and color
  const getStatusTag = (assignment: any) => {
    if (!assignment.is_published) {
      return <Tag color="orange">Draft</Tag>;
    }
    
    const daysUntilDue = getDaysUntilDue(assignment.due_date);
    
    if (daysUntilDue < 0) {
      return <Tag color="red">Past Due</Tag>;
    } else if (daysUntilDue <= 3) {
      return <Tag color="volcano">Due Soon</Tag>;
    } else {
      return <Tag color="green">Active</Tag>;
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would create an assignment record via API
      console.log('Submitting form with values:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      message.success('Assignment created successfully!');
      
      // Close the modal and reset form
      setCreateModalVisible(false);
      form.resetFields();
      
      // Add the new assignment to the list (in a real app, we would fetch the updated list)
      const newAssignment = {
        id: Math.max(...assignments.map(a => a.id)) + 1,
        course_id: values.course_id,
        title: values.title,
        description: values.description,
        type: values.type,
        points: values.points,
        due_date: values.due_date?.toISOString() || new Date().toISOString(),
        release_date: values.release_date?.toISOString() || new Date().toISOString(),
        is_published: values.is_published,
        allow_late_submissions: values.allow_late_submissions,
        late_penalty: values.allow_late_submissions ? values.late_penalty : 0,
        submission_type: values.submission_type,
        status: values.is_published ? 'active' : 'draft',
        submissions: 0,
        total_students: mockCourses.find(c => c.id === values.course_id)?.id === 1 ? 32 : 
                        mockCourses.find(c => c.id === values.course_id)?.id === 2 ? 28 : 22
      };
      
      setAssignments([...assignments, newAssignment]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      message.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle publish/unpublish toggle
  const handlePublishToggle = (id: number, currentStatus: boolean) => {
    // In a real app, we would call an API to update the status
    const updatedAssignments = assignments.map(assignment => 
      assignment.id === id ? { ...assignment, is_published: !currentStatus } : assignment
    );
    
    setAssignments(updatedAssignments);
    message.success(`Assignment ${currentStatus ? 'unpublished' : 'published'} successfully`);
  };

  // Function to handle delete
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this assignment?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // In a real app, we would call an API to delete the assignment
        const updatedAssignments = assignments.filter(assignment => assignment.id !== id);
        setAssignments(updatedAssignments);
        message.success('Assignment deleted successfully');
      }
    });
  };

  // Column definition for the assignments table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className="flex items-start">
          <div className="p-2 rounded-lg bg-primary/10 mr-3">
            {record.type === 'assignment' ? <FileText className="h-5 w-5 text-primary" /> : 
             record.type === 'quiz' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
             record.type === 'project' ? <Book className="h-5 w-5 text-orange-500" /> :
             <FileText className="h-5 w-5 text-blue-500" />}
          </div>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const assignmentType = assignmentTypes.find(t => t.value === type);
        return (
          <Tag color={assignmentType?.color || 'default'}>
            {assignmentType?.label || type}
          </Tag>
        );
      },
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => (
        <div className="font-medium">{points} pts</div>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => getStatusTag(record),
    },
    {
      title: 'Submissions',
      key: 'submissions',
      render: (record: any) => (
        <div className="flex flex-col">
          <div className="font-medium">{record.submissions}/{record.total_students}</div>
          <Progress 
            percent={Math.round((record.submissions / record.total_students) * 100)} 
            showInfo={false}
            size="small"
            strokeColor={record.submissions > 0 ? "#1890ff" : "#d9d9d9"}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex space-x-2">
          <Tooltip title="Edit">
            <Button type="text" icon={<Edit className="h-4 w-4" />} />
          </Tooltip>
          <Tooltip title={record.is_published ? "Unpublish" : "Publish"}>
            <Button 
              type="text" 
              icon={record.is_published ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onClick={() => handlePublishToggle(record.id, record.is_published)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<Trash2 className="h-4 w-4" />} 
              onClick={() => handleDelete(record.id)}
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
          <Breadcrumb.Item>Assignment Creation</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary" />
            Assignment Creation & Management
          </h1>
          <div className="mt-4 md:mt-0">
            <Button 
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create New Assignment
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filter and search section */}
      <div className="bg-background border border-border p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium mb-1">Course</label>
            <Select
              placeholder="Select Course"
              className="w-full"
              allowClear
              onChange={(value) => setSelectedCourse(value)}
            >
              {mockCourses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_code}: {course.title}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium mb-1">Assignment Type</label>
            <Select
              placeholder="All Types"
              className="w-full"
              allowClear
              onChange={(value) => console.log(value)}
            >
              {assignmentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-2/4">
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search by title or description"
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Assignments Dashboard */}
      <Card className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-4"
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                All Assignments
              </span>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Published
              </span>
            } 
            key="published" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Active
              </span>
            } 
            key="active" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Drafts
              </span>
            } 
            key="drafts" 
          />
        </Tabs>
        
        <Table
          dataSource={filteredAssignments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Assignment Types" className="shadow-sm">
          <div className="space-y-3">
            {assignmentTypes.map(type => {
              const count = assignments.filter(a => a.type === type.value).length;
              const percentage = assignments.length ? (count / assignments.length) * 100 : 0;
              return (
                <div key={type.value}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{type.label}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <Progress percent={percentage} showInfo={false} />
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card title="Submission Statistics" className="shadow-sm">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Overall Submission Rate</div>
              <div className="flex items-center">
                <Progress 
                  type="circle" 
                  percent={Math.round(
                    (assignments.reduce((sum, a) => sum + a.submissions, 0) / 
                    assignments.reduce((sum, a) => sum + a.total_students, 0)) * 100
                  )} 
                  width={80}
                />
                <div className="ml-4">
                  <div className="text-xl font-bold">
                    {assignments.reduce((sum, a) => sum + a.submissions, 0)} / {assignments.reduce((sum, a) => sum + a.total_students, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total submissions</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Due Soon</div>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-orange-100 mr-3">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {assignments.filter(a => {
                      const daysUntilDue = getDaysUntilDue(a.due_date);
                      return daysUntilDue >= 0 && daysUntilDue <= 7;
                    }).length} assignments
                  </div>
                  <div className="text-sm text-muted-foreground">Due in the next 7 days</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Assignment Overview" className="shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm">Total Assignments</div>
              <div className="text-lg font-bold">{assignments.length}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm">Published</div>
              <div className="text-lg font-bold">{assignments.filter(a => a.is_published).length}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm">Drafts</div>
              <div className="text-lg font-bold">{assignments.filter(a => !a.is_published).length}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm">Past Due</div>
              <div className="text-lg font-bold">{assignments.filter(a => getDaysUntilDue(a.due_date) < 0).length}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm">Total Points</div>
              <div className="text-lg font-bold">{assignments.reduce((sum, a) => sum + a.points, 0)}</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Create Assignment Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Create New Assignment
          </div>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            points: 10,
            is_published: true,
            allow_late_submissions: true,
            late_penalty: 10,
            submission_type: 'online'
          }}
        >
          <Form.Item
            name="course_id"
            label="Course"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select placeholder="Select Course">
              {mockCourses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.course_code}: {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="title"
            label="Assignment Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="E.g., Java Programming Exercise 1" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description/Instructions"
            rules={[{ required: true, message: 'Please enter assignment instructions' }]}
          >
            <TextArea rows={4} placeholder="Provide detailed instructions for students..." />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Assignment Type"
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select placeholder="Select Assignment Type">
                {assignmentTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="points"
              label="Points"
              rules={[{ required: true, message: 'Please specify points' }]}
            >
              <InputNumber min={0} max={1000} className="w-full" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="release_date"
              label="Release Date"
              rules={[{ required: true, message: 'Please set a release date' }]}
            >
              <DatePicker className="w-full" showTime />
            </Form.Item>
            
            <Form.Item
              name="due_date"
              label="Due Date"
              rules={[{ required: true, message: 'Please set a due date' }]}
            >
              <DatePicker className="w-full" showTime />
            </Form.Item>
          </div>
          
          <Form.Item
            name="submission_type"
            label="Submission Type"
            rules={[{ required: true, message: 'Please select a submission type' }]}
          >
            <Select placeholder="Select Submission Type">
              {submissionTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="allow_late_submissions"
            label="Allow Late Submissions"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.allow_late_submissions !== currentValues.allow_late_submissions}
          >
            {({ getFieldValue }) => 
              getFieldValue('allow_late_submissions') ? (
                <Form.Item
                  name="late_penalty"
                  label="Late Submission Penalty (%)"
                >
                  <InputNumber min={0} max={100} className="w-full" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          
          <Form.Item
            name="is_published"
            label="Availability"
          >
            <Radio.Group>
              <Radio value={true}>Published - Visible to students</Radio>
              <Radio value={false}>Draft - Hidden from students</Radio>
            </Radio.Group>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Assignment
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseAssignments; 