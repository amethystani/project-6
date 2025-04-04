import React, { useState, useEffect } from 'react';
import { Card, Tabs, Select, Table, Tag, Button, Tooltip, message, Modal, Space, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../lib/auth';

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

const ResourceAllocation = () => {
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>();
  const [currentApproval, setCurrentApproval] = useState<CourseApproval | null>(null);
  const [comment, setComment] = useState('');
  const { token } = useAuth();

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-approvals?status=${selectedStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setCourseApprovals(response.data.data);
      } else {
        message.error('Failed to fetch course approvals');
      }
    } catch (error) {
      console.error('Error fetching course approvals:', error);
      message.error('Failed to fetch course approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseApprovals();
  }, [selectedStatus, token]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const showCommentModal = (approval: CourseApproval, type: 'approve' | 'reject') => {
    setCurrentApproval(approval);
    setActionType(type);
    setCommentModalVisible(true);
  };

  const handleCancel = () => {
    setCommentModalVisible(false);
    setComment('');
  };

  const handleAction = async () => {
    if (!currentApproval) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/course-approvals/${currentApproval.id}`,
        {
          status: actionType === 'approve' ? 'approved' : 'rejected',
          comments: comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        message.success(`Course ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        setCommentModalVisible(false);
        setComment('');
        fetchCourseApprovals();
      } else {
        message.error(response.data.message || `Failed to ${actionType} course`);
      }
    } catch (error) {
      console.error('Error updating course approval:', error);
      message.error(`Failed to ${actionType} course`);
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

  const getRequesterName = (approval: CourseApproval) => {
    if (!approval.requested_by) return 'Unknown';
    
    // In a real implementation, you would fetch user info or have it included in the response
    return `User ID: ${approval.requested_by}`;
  };

  const courseColumns = [
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
      title: 'Description',
      dataIndex: ['course', 'description'],
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description || 'N/A'}
        </Tooltip>
      ),
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
      title: 'Requested By',
      key: 'requested_by',
      render: (_: any, record: CourseApproval) => getRequesterName(record),
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseApproval) => {
        if (record.status !== 'pending') {
          return null;
        }
        return (
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => showCommentModal(record, 'approve')}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => showCommentModal(record, 'reject')}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Course Approval Management</h1>
          <Select 
            value={selectedStatus} 
            onChange={handleStatusChange}
            style={{ width: 120 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </div>
        
        <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-700 flex items-center">
            <span className="mr-2">ℹ️</span>
            Review course requests from department heads and faculty. Approving a course will make it available in the course catalog.
          </p>
        </div>
        
        <Table 
          dataSource={courseApprovals} 
          columns={courseColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onChange={() => {}} // Added to make the table sortable
        />
        
        <Modal
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Course`}
          open={commentModalVisible}
          onOk={handleAction}
          onCancel={handleCancel}
          okText={actionType === 'approve' ? 'Approve' : 'Reject'}
          okButtonProps={{ 
            type: actionType === 'approve' ? 'primary' : 'primary',
            danger: actionType === 'reject'
          }}
        >
          <p>
            {actionType === 'approve' 
              ? 'Are you sure you want to approve this course?' 
              : 'Are you sure you want to reject this course?'}
          </p>
          <div className="mt-4">
            <label className="block mb-2">Comments (optional):</label>
            <Input.TextArea 
              rows={4} 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments about this decision..."
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ResourceAllocation; 