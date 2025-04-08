import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft,
  Users,
  Book,
  Search,
  BellRing,
  CalendarCheck,
  Send,
  FileText,
  Download
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
  Avatar,
  Badge,
  Switch,
  Divider,
  Typography,
  Radio,
  Checkbox,
  TimePicker
} from 'antd';
import { SearchOutlined, BellOutlined, SendOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import axios from 'axios';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

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

// Mock data for announcements
const mockAnnouncements = [
  {
    id: 1,
    course_id: 1,
    title: 'Midterm Exam Information',
    content: 'The midterm exam will be held on April 15th from 10:00 AM to 12:00 PM in room 201. Please bring your student ID and a pencil. The exam will cover all material from weeks 1-5.',
    author: 'Dr. Johnson',
    created_at: '2024-04-01T09:30:00',
    scheduled_for: '2024-04-01T09:30:00',
    is_published: true,
    priority: 'high',
    views: 28,
    target_groups: ['all'],
    has_attachment: false,
    requires_acknowledgment: true,
    acknowledged_by: 24,
    type: 'exam'
  },
  {
    id: 2,
    course_id: 1,
    title: 'Assignment 3 Deadline Extended',
    content: 'Due to the system outage last weekend, the deadline for Assignment 3 has been extended to April 20th at 11:59 PM. Please submit your work through the course portal.',
    author: 'Dr. Johnson',
    created_at: '2024-04-02T14:15:00',
    scheduled_for: '2024-04-02T14:15:00',
    is_published: true,
    priority: 'medium',
    views: 31,
    target_groups: ['all'],
    has_attachment: false,
    requires_acknowledgment: false,
    acknowledged_by: 0,
    type: 'assignment'
  },
  {
    id: 3,
    course_id: 1,
    title: 'Special Guest Lecture Next Week',
    content: 'We will have a special guest lecture next Wednesday by Dr. Jane Smith from Google. The topic will be "Real-world Applications of Algorithms." Attendance is highly recommended.',
    author: 'Dr. Johnson',
    created_at: '2024-04-05T10:45:00',
    scheduled_for: '2024-04-10T08:00:00',
    is_published: true,
    priority: 'medium',
    views: 19,
    target_groups: ['all'],
    has_attachment: false,
    requires_acknowledgment: false,
    acknowledged_by: 0,
    type: 'event'
  },
  {
    id: 4,
    course_id: 1,
    title: 'Office Hours Canceled Tomorrow',
    content: 'Due to a faculty meeting, my office hours for tomorrow (April 8th) are canceled. If you need assistance, please email me to schedule an alternative time.',
    author: 'Dr. Johnson',
    created_at: '2024-04-07T16:30:00',
    scheduled_for: '2024-04-07T16:30:00',
    is_published: true,
    priority: 'low',
    views: 15,
    target_groups: ['all'],
    has_attachment: false,
    requires_acknowledgment: false,
    acknowledged_by: 0,
    type: 'general'
  },
  {
    id: 5,
    course_id: 1,
    title: 'Reading Materials for Week 6',
    content: 'The reading materials for Week 6 are now available in the course resources section. Please review Chapters 8 and 9 before our next lecture.',
    author: 'Dr. Johnson',
    created_at: '2024-04-06T11:20:00',
    scheduled_for: '2024-04-09T08:00:00',
    is_published: false,
    priority: 'low',
    views: 0,
    target_groups: ['all'],
    has_attachment: true,
    requires_acknowledgment: false,
    acknowledged_by: 0,
    type: 'resource'
  },
  {
    id: 6,
    course_id: 2,
    title: 'Midterm Exam Details',
    content: 'The midterm exam for Data Structures and Algorithms will be held on April 18th from 2:00 PM to 4:00 PM in room 302. The exam will be closed-book and cover all topics we\'ve discussed so far.',
    author: 'Dr. Williams',
    created_at: '2024-04-03T13:40:00',
    scheduled_for: '2024-04-03T13:40:00',
    is_published: true,
    priority: 'high',
    views: 26,
    target_groups: ['all'],
    has_attachment: false,
    requires_acknowledgment: true,
    acknowledged_by: 21,
    type: 'exam'
  },
  {
    id: 7,
    course_id: 3,
    title: 'Final Project Teams',
    content: 'Final project teams have been formed based on your preferences. Please check the course portal to see your team members. Each team should schedule a meeting this week to begin planning.',
    author: 'Dr. Garcia',
    created_at: '2024-04-04T09:25:00',
    scheduled_for: '2024-04-04T09:25:00',
    is_published: true,
    priority: 'medium',
    views: 22,
    target_groups: ['all'],
    has_attachment: true,
    requires_acknowledgment: false,
    acknowledged_by: 0,
    type: 'project'
  }
];

// Announcement types
const announcementTypes = [
  { value: 'general', label: 'General Announcement', color: 'blue' },
  { value: 'assignment', label: 'Assignment Information', color: 'green' },
  { value: 'exam', label: 'Exam Information', color: 'red' },
  { value: 'event', label: 'Events and Lectures', color: 'purple' },
  { value: 'resource', label: 'Course Materials', color: 'cyan' },
  { value: 'project', label: 'Project Information', color: 'orange' }
];

// Priority levels
const priorityLevels = [
  { value: 'low', label: 'Low', color: 'blue' },
  { value: 'medium', label: 'Medium', color: 'orange' },
  { value: 'high', label: 'High', color: 'red' }
];

// Target groups
const targetGroups = [
  { value: 'all', label: 'All Students' },
  { value: 'group-a', label: 'Group A Only' },
  { value: 'group-b', label: 'Group B Only' },
];

const CourseAnnouncements = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const [isScheduled, setIsScheduled] = useState(false);

  // Use Effect to initialize
  useEffect(() => {
    // In a real implementation, we would fetch announcements from the API
    // Here we're just using mock data
    
    if (selectedCourse) {
      // Filter announcements by selected course
      setAnnouncements(mockAnnouncements.filter(announcement => announcement.course_id === selectedCourse));
    } else {
      setAnnouncements(mockAnnouncements);
    }
  }, [selectedCourse]);

  // Filter announcements based on search text and active tab
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchText.toLowerCase()) || 
      announcement.content.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'published' && announcement.is_published) || 
      (activeTab === 'scheduled' && (new Date(announcement.scheduled_for) > new Date() && announcement.is_published)) ||
      (activeTab === 'drafts' && !announcement.is_published);
    
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

  // Get priority tag
  const getPriorityTag = (priority: string) => {
    const priorityInfo = priorityLevels.find(p => p.value === priority);
    return (
      <Tag color={priorityInfo?.color || 'default'}>
        {priorityInfo?.label || priority}
      </Tag>
    );
  };

  // Get type tag
  const getTypeTag = (type: string) => {
    const typeInfo = announcementTypes.find(t => t.value === type);
    return (
      <Tag color={typeInfo?.color || 'default'}>
        {typeInfo?.label || type}
      </Tag>
    );
  };

  // Handle form submission for creating an announcement
  const handleCreateAnnouncement = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would create an announcement record via API
      console.log('Submitting form with values:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new announcement object
      const scheduledFor = isScheduled && values.scheduled_date && values.scheduled_time
        ? dayjs(`${values.scheduled_date.format('YYYY-MM-DD')} ${values.scheduled_time.format('HH:mm:ss')}`).toISOString()
        : new Date().toISOString();
      
      const newAnnouncement = {
        id: Math.max(...announcements.map(a => a.id)) + 1,
        course_id: values.course_id,
        title: values.title,
        content: values.content,
        author: 'Dr. Johnson', // Hardcoded for demo
        created_at: new Date().toISOString(),
        scheduled_for: scheduledFor,
        is_published: values.is_published,
        priority: values.priority,
        views: 0,
        target_groups: values.target_groups || ['all'],
        has_attachment: values.has_attachment || false,
        requires_acknowledgment: values.requires_acknowledgment || false,
        acknowledged_by: 0,
        type: values.type
      };
      
      // Add to announcements list
      setAnnouncements([...announcements, newAnnouncement]);
      
      // Show success message
      message.success('Announcement created successfully!');
      
      // Close the modal and reset form
      setCreateModalVisible(false);
      form.resetFields();
      setIsScheduled(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      message.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete announcement
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this announcement?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // In a real app, we would call an API to delete the announcement
        const updatedAnnouncements = announcements.filter(announcement => announcement.id !== id);
        setAnnouncements(updatedAnnouncements);
        message.success('Announcement deleted successfully');
      }
    });
  };

  // Toggle announcement publish status
  const togglePublishStatus = (id: number, currentStatus: boolean) => {
    const updatedAnnouncements = announcements.map(announcement => 
      announcement.id === id ? { ...announcement, is_published: !currentStatus } : announcement
    );
    
    setAnnouncements(updatedAnnouncements);
    message.success(`Announcement ${currentStatus ? 'unpublished' : 'published'} successfully`);
  };

  // View announcement details
  const viewAnnouncementDetails = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setViewModalVisible(true);
    
    // In a real app, this would update the view count via API
    const updatedAnnouncements = announcements.map(a => 
      a.id === announcement.id ? { ...a, views: a.views + 1 } : a
    );
    
    setAnnouncements(updatedAnnouncements);
  };

  // Column definition for the announcements table
  const columns = [
    {
      title: 'Title & Type',
      key: 'title',
      render: (record: any) => (
        <div className="flex flex-col cursor-pointer" onClick={() => viewAnnouncementDetails(record)}>
          <div className="font-medium">{record.title}</div>
          <div className="mt-1">{getTypeTag(record.type)}</div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: 'Date',
      key: 'date',
      render: (record: any) => {
        const isScheduledForFuture = new Date(record.scheduled_for) > new Date();
        return (
          <div className="flex flex-col">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {formatDate(record.scheduled_for)}
            </div>
            {isScheduledForFuture && record.is_published && (
              <Tag className="mt-1" color="blue">Scheduled</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => (
        <div className="flex flex-col">
          <Tag color={record.is_published ? 'green' : 'orange'}>
            {record.is_published ? 'Published' : 'Draft'}
          </Tag>
          {record.requires_acknowledgment && (
            <div className="text-xs mt-1 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {record.acknowledged_by}/{record.course_id === 1 ? 32 : record.course_id === 2 ? 28 : 22}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (record: any) => (
        <div className="flex items-center">
          <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
          {record.views} views
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex space-x-2">
          <Tooltip title="View Details">
            <Button type="text" icon={<Eye className="h-4 w-4" />} onClick={() => viewAnnouncementDetails(record)} />
          </Tooltip>
          <Tooltip title={record.is_published ? "Unpublish" : "Publish"}>
            <Button 
              type="text" 
              icon={record.is_published ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              onClick={() => togglePublishStatus(record.id, record.is_published)}
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
          <Breadcrumb.Item>Announcements</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Bell className="h-6 w-6 mr-2 text-primary" />
            Course Announcements
          </h1>
          <div className="mt-4 md:mt-0">
            <Button 
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Announcement
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filter and search section */}
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
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">Announcement Type</label>
            <Select
              placeholder="All Types"
              className="w-full"
              allowClear
              onChange={(value) => console.log(value)}
            >
              {announcementTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search announcements"
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">{announcements.length}</div>
              <div className="text-sm text-muted-foreground">Total Announcements</div>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">{announcements.filter(a => a.is_published).length}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-orange-100 mr-3">
              <CalendarCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                {announcements.filter(a => new Date(a.scheduled_for) > new Date() && a.is_published).length}
              </div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 mr-3">
              <BellRing className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                {announcements.filter(a => a.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Announcements Table */}
      <Card className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-4"
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                All Announcements
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
                <Calendar className="h-4 w-4 mr-2" />
                Scheduled
              </span>
            } 
            key="scheduled" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Drafts
              </span>
            } 
            key="drafts" 
          />
        </Tabs>
        
        <Table
          dataSource={filteredAnnouncements}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Create Announcement Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Create New Announcement
          </div>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setIsScheduled(false);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAnnouncement}
          initialValues={{
            priority: 'medium',
            type: 'general',
            is_published: true,
            target_groups: ['all'],
            requires_acknowledgment: false
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
                  {course.course_code}: {course.title} (Section {course.section})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="title"
            label="Announcement Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="E.g., Midterm Exam Details" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Announcement Content"
            rules={[{ required: true, message: 'Please enter announcement content' }]}
          >
            <TextArea rows={6} placeholder="Enter the announcement details here..." />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Announcement Type"
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select placeholder="Select Announcement Type">
                {announcementTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="priority"
              label="Priority Level"
              rules={[{ required: true, message: 'Please select a priority level' }]}
            >
              <Select placeholder="Select Priority">
                {priorityLevels.map(priority => (
                  <Option key={priority.value} value={priority.value}>{priority.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="target_groups"
            label="Target Audience"
            rules={[{ required: true, message: 'Please select target audience' }]}
          >
            <Select 
              placeholder="Select Audience" 
              mode="multiple"
              defaultValue={['all']}
            >
              {targetGroups.map(group => (
                <Option key={group.value} value={group.value}>{group.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <Form.Item
              label="Schedule for later"
              className="mb-0"
            >
              <Switch checked={isScheduled} onChange={setIsScheduled} />
            </Form.Item>
            
            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Form.Item
                  name="scheduled_date"
                  label="Date"
                  rules={[{ required: isScheduled, message: 'Please select a date' }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
                
                <Form.Item
                  name="scheduled_time"
                  label="Time"
                  rules={[{ required: isScheduled, message: 'Please select a time' }]}
                >
                  <TimePicker className="w-full" format="HH:mm" />
                </Form.Item>
              </div>
            )}
          </div>
          
          <Form.Item
            name="requires_acknowledgment"
            valuePropName="checked"
          >
            <Checkbox>Require students to acknowledge this announcement</Checkbox>
          </Form.Item>
          
          <Form.Item
            name="has_attachment"
            valuePropName="checked"
          >
            <Checkbox>This announcement has attachments</Checkbox>
          </Form.Item>
          
          <Form.Item
            name="is_published"
            label="Publication Status"
          >
            <Radio.Group>
              <Radio value={true}>Publish{isScheduled ? ' at scheduled time' : ' immediately'}</Radio>
              <Radio value={false}>Save as draft</Radio>
            </Radio.Group>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setIsScheduled(false);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isScheduled ? 'Schedule' : 'Create'} Announcement
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* View Announcement Modal */}
      {selectedAnnouncement && (
        <Modal
          title={
            <div className="flex items-center mb-1">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              <span className="font-bold">Announcement Details</span>
            </div>
          }
          open={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setSelectedAnnouncement(null);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => {
                setViewModalVisible(false);
                setSelectedAnnouncement(null);
              }}
            >
              Close
            </Button>,
            <Button 
              key="edit" 
              type="default"
              icon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>,
            <Button 
              key="resend" 
              type="primary"
              icon={<Send className="h-4 w-4" />}
            >
              Resend
            </Button>
          ]}
          width={700}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getTypeTag(selectedAnnouncement.type)}
              {getPriorityTag(selectedAnnouncement.priority)}
              <Tag color={selectedAnnouncement.is_published ? 'green' : 'orange'}>
                {selectedAnnouncement.is_published ? 'Published' : 'Draft'}
              </Tag>
              {selectedAnnouncement.requires_acknowledgment && (
                <Tag color="purple">Requires Acknowledgment</Tag>
              )}
              {selectedAnnouncement.has_attachment && (
                <Tag color="cyan">Has Attachments</Tag>
              )}
            </div>
            
            <Title level={4}>{selectedAnnouncement.title}</Title>
            
            <div className="flex justify-between flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Published: {formatDate(selectedAnnouncement.scheduled_for)}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                For: {targetGroups.find(g => g.value === selectedAnnouncement.target_groups[0])?.label || 'All Students'}
              </div>
            </div>
            
            <Divider />
            
            <Paragraph>
              {selectedAnnouncement.content}
            </Paragraph>
            
            {selectedAnnouncement.has_attachment && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium">Attachment-1.pdf</div>
                    <div className="text-xs text-muted-foreground">PDF Document, 1.2 MB</div>
                  </div>
                  <Button type="text" icon={<Download className="h-4 w-4" />} />
                </div>
              </div>
            )}
            
            <Divider />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Text type="secondary">Views</Text>
                <div className="text-lg font-semibold flex items-center">
                  <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                  {selectedAnnouncement.views}
                </div>
              </div>
              
              {selectedAnnouncement.requires_acknowledgment && (
                <div className="flex flex-col">
                  <Text type="secondary">Acknowledgments</Text>
                  <div className="text-lg font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    {selectedAnnouncement.acknowledged_by}/
                    {selectedAnnouncement.course_id === 1 ? 32 : selectedAnnouncement.course_id === 2 ? 28 : 22}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col">
                <Text type="secondary">Created by</Text>
                <div className="text-lg font-semibold">
                  {selectedAnnouncement.author}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseAnnouncements; 