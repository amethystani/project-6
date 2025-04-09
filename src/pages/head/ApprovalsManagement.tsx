import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Modal, Select, Table, Tag, InputNumber, message, Alert, Tabs } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { PlusCircle, Book, ClipboardCheck } from 'lucide-react';

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

const ApprovalsManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('pending');

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      // Use a hardcoded API URL if the environment variable isn't available
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('Fetching course approvals from:', `${apiUrl}/api/department-head/course-approvals`);
      
      const response = await axios.get(`${apiUrl}/api/department-head/course-approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Received response:', response);
      
      if (response.data.status === 'success') {
        setCourseApprovals(response.data.data);
        message.success('Course approvals loaded successfully');
      } else {
        console.error('Failed response:', response.data);
        message.error('Failed to fetch course approvals: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error fetching course approvals:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        message.error(`Failed to fetch course approvals: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        message.error('Failed to connect to server. Please check your network connection.');
      } else {
        message.error('Failed to fetch course approvals: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseApprovals();
  }, [token]);

  const showModal = () => {
    console.log('Opening course request modal');
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    
    try {
      console.log('Original form values:', values);
      
      // Prepare the data for submission
      const submitData = {
        course_code: values.course_code,
        title: values.title,
        description: values.description,
        credits: values.credits,
        department: values.department,
        prerequisites: values.prerequisites || '',
        capacity: values.capacity || 30,
        justification: values.justification || ''
      };
      
      console.log('Submitting course data:', submitData);
      
      // Using our simplified endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/api/department-head/simple-course-submit`;
      console.log('Using simplified endpoint:', endpoint);
      
      const response = await axios.post(endpoint, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);
      
      if (response.data.status === 'success') {
        Modal.success({
          title: 'Course Submitted Successfully',
          content: (
            <div>
              <p>Your course request has been submitted and is pending approval.</p>
              <p>A unique code has been assigned: <strong>{response.data.data?.course?.course_code}</strong></p>
            </div>
          )
        });
        
        setIsModalVisible(false);
        form.resetFields();
        fetchCourseApprovals();
      } else {
        message.error(`Course submission failed: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Error submitting course:', error);
      
      // Create a detailed error message
      let errorMessage = 'Failed to submit course';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      
      // Show error to user
      Modal.error({
        title: 'Course Submission Failed',
        content: errorMessage
      });
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

  const filteredApprovals = courseApprovals.filter(approval => {
    if (activeTab === 'all') return true;
    return approval.status === activeTab;
  });

  const columns = [
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Course Requests Management</h1>
        <div className="flex space-x-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchCourseApprovals} 
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            onClick={showModal}
            icon={<PlusCircle size={16} className="mr-1" />}
            size="large"
          >
            Request New Course
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-700 flex items-center">
          <Book className="mr-2 h-5 w-5" />
          Request new courses for your department. All requests will be reviewed by an administrator before being added to the course catalog.
        </p>
      </div>

      <Tabs 
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        className="mb-4"
      >
        <TabPane tab="Pending" key="pending" />
        <TabPane tab="Approved" key="approved" />
        <TabPane tab="Rejected" key="rejected" />
        <TabPane tab="All Requests" key="all" />
      </Tabs>

      <Table 
        dataSource={filteredApprovals} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Request New Course"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="course_code"
              label="Course Code"
              rules={[{ required: true, message: 'Please enter course code' }]}
            >
              <Input placeholder="e.g., CS101" />
            </Form.Item>

            <Form.Item
              name="title"
              label="Course Title"
              rules={[{ required: true, message: 'Please enter course title' }]}
            >
              <Input placeholder="e.g., Introduction to Programming" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Course Description"
            rules={[{ required: true, message: 'Please provide a course description' }]}
          >
            <TextArea rows={4} placeholder="Detailed course description including topics covered, learning objectives, etc." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                <Option value="Computer Science">Computer Science</Option>
                <Option value="Mathematics">Mathematics</Option>
                <Option value="Physics">Physics</Option>
                <Option value="Chemistry">Chemistry</Option>
                <Option value="Biology">Biology</Option>
                <Option value="Engineering">Engineering</Option>
                <Option value="Business">Business</Option>
                <Option value="Arts">Arts</Option>
                <Option value="Humanities">Humanities</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="credits"
              label="Credits"
              rules={[{ required: true, message: 'Please enter credits' }]}
            >
              <InputNumber min={1} max={6} placeholder="3" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="prerequisites"
              label="Prerequisites"
              help="Comma-separated course codes (e.g., CS101, MATH101)"
            >
              <Input placeholder="e.g., CS101, MATH101" />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Maximum Capacity"
              initialValue={30}
              rules={[{ required: true, message: 'Please enter capacity' }]}
            >
              <InputNumber min={1} max={500} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="justification"
            label="Request Justification"
            help="Provide a brief explanation for why this course should be added"
          >
            <TextArea rows={3} placeholder="Explain why this course would be valuable for students and the department" />
          </Form.Item>

          <div className="flex justify-end">
            <Button htmlType="button" onClick={handleCancel} className="mr-2">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitting}
              icon={<ClipboardCheck className="h-4 w-4 mr-1" />}
            >
              Submit for Approval
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalsManagement; 