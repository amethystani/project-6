import React, { useState, useEffect } from 'react';
import { Card, Tabs, Select, Table, Tag, Button, Tooltip, message, Modal, Space, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      // Use hardcoded API URL if environment variable isn't available
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await axios.get(`${apiUrl}/api/course-approvals?status=${selectedStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched course approvals:', response.data);
      
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

  // Handle URL params only once when component mounts
  useEffect(() => {
    const handleUrlParams = async () => {
      const params = new URLSearchParams(location.search);
      const approvalIdParam = params.get('approvalId');
      const actionParam = params.get('action');
      
      console.log('Processing URL parameters on mount:', { approvalIdParam, actionParam, locationSearch: location.search });
      
      if (approvalIdParam && actionParam && (actionParam === 'approve' || actionParam === 'reject')) {
        // Set selected status to pending to ensure we can find the approval
        setSelectedStatus('pending');
        const approvalId = parseInt(approvalIdParam, 10);
        
        console.log('Attempting to process approval ID:', approvalId);
        
        try {
          console.log('Fetching approval data from API...');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const response = await axios.get(`${apiUrl}/api/course-approvals?status=pending`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('API response for approval lookup:', response.data);
          
          if (response.data.status === 'success') {
            const approvals = response.data.data || [];
            
            // Update the course approvals list with the data we just fetched
            setCourseApprovals(approvals);
            
            // Find the approval we're looking for
            const approval = approvals.find((a: any) => a.id === approvalId);
            
            if (approval) {
              console.log('Found approval to process from API:', approval);
              setCurrentApproval(approval);
              setActionType(actionParam as 'approve' | 'reject');
              setTimeout(() => {
                setCommentModalVisible(true);
              }, 500); // Short delay to ensure state is updated
            } else {
              console.error(`Approval with ID ${approvalId} not found in API response`);
              message.error(`Could not find the course approval with ID ${approvalId}. It may have already been processed.`);
            }
          } else {
            console.error('API error:', response.data);
            message.error('Failed to fetch course approval data');
          }
        } catch (error) {
          console.error('Error fetching approval by ID:', error);
          message.error('Network error when trying to fetch approval data');
        }
      }
    };
    
    handleUrlParams();
    // This effect should only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!currentApproval) {
      message.error('No approval selected for action');
      setCommentModalVisible(false);
      return;
    }

    setActionLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Use the correct endpoint structure with PUT method
      const approvalEndpoint = `${apiUrl}/api/course-approvals/${currentApproval.id}`;
      
      console.log(`Processing ${actionType} action for approval ID ${currentApproval.id}`);
      console.log(`Sending request to: ${approvalEndpoint}`);
      
      // Send the PUT request with status and comments
      const payload = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        comments: comment
      };
      
      console.log('Sending payload:', payload);
      
      const response = await axios.put(
        approvalEndpoint,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API response:', response.data);

      if (response.data.status === 'success') {
        // Show success message with longer duration
        message.success({
          content: `Course request has been ${actionType === 'approve' ? 'APPROVED' : 'REJECTED'} successfully!`,
          duration: 5,
          style: { marginTop: '20px', fontWeight: 'bold' }
        });
        
        // Clear current approval and close modal
        setCurrentApproval(null);
        setCommentModalVisible(false);
        setComment('');
        
        // Refresh the data after action
        await fetchCourseApprovals();
        
        // Clear URL parameters and redirect back to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        message.error({
          content: response.data.message || `Failed to ${actionType} course request`,
          duration: 5,
          style: { marginTop: '20px', fontWeight: 'bold' }
        });
      }
    } catch (error) {
      console.error(`Error during ${actionType} action:`, error);
      message.error({
        content: `An error occurred while trying to ${actionType} the course. Server error occurred.`,
        duration: 5
      });
    } finally {
      setActionLoading(false);
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
      width: '10%',
    },
    {
      title: 'Title',
      dataIndex: ['course', 'title'],
      key: 'title',
      width: '15%',
    },
    {
      title: 'Description',
      dataIndex: ['course', 'description'],
      key: 'description',
      width: '12%',
      ellipsis: true,
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
      width: '15%',
    },
    {
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
      width: '8%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Requested By',
      key: 'requested_by',
      width: '10%',
      render: (_: any, record: CourseApproval) => getRequesterName(record),
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      width: '12%',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: any, record: CourseApproval) => {
        if (record.status !== 'pending') {
          return null;
        }
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => showCommentModal(record, 'approve')}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
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
          <div className="flex items-center gap-2">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchCourseApprovals}
              loading={loading}
            >
              Refresh
            </Button>
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
        </div>
        
        <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-700 flex items-center">
            <span className="mr-2">ℹ️</span>
            Review course requests from department heads and faculty. Approving a course will make it available in the course catalog.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table 
            dataSource={courseApprovals} 
            columns={courseColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            onChange={() => {}} // Added to make the table sortable
            key={`course-table-${selectedStatus}`} // Add key to force re-render when status changes
          />
        </div>
        
        <Modal
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Course`}
          open={commentModalVisible}
          onOk={handleAction}
          onCancel={handleCancel}
          okText={actionType === 'approve' ? 'Approve' : 'Reject'}
          okButtonProps={{ 
            type: actionType === 'approve' ? 'primary' : 'primary',
            danger: actionType === 'reject',
            loading: actionLoading,
            size: 'large'
          }}
          cancelButtonProps={{
            disabled: actionLoading,
            size: 'large'
          }}
          closable={!actionLoading}
          maskClosable={!actionLoading}
          width={600}
        >
          <div className="text-lg font-medium mb-4">
            {actionType === 'approve' 
              ? 'Are you sure you want to approve this course?' 
              : 'Are you sure you want to reject this course?'}
          </div>
          
          {currentApproval && (
            <div className="bg-gray-50 p-4 my-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-2">Course Details:</h3>
              <div className="grid grid-cols-1 gap-2">
                <p className="text-md mb-1">
                  <span className="font-medium">Course Code:</span> {currentApproval.course?.course_code}
                </p>
                <p className="text-md mb-1">
                  <span className="font-medium">Title:</span> {currentApproval.course?.title}
                </p>
                <p className="text-md mb-1">
                  <span className="font-medium">Department:</span> {currentApproval.course?.department}
                </p>
                <p className="text-md mb-1">
                  <span className="font-medium">Credits:</span> {currentApproval.course?.credits}
                </p>
                <p className="text-md mb-1">
                  <span className="font-medium">Requested By:</span> User ID: {currentApproval.requested_by}
                </p>
                <p className="text-md mb-1">
                  <span className="font-medium">Request Date:</span> {new Date(currentApproval.requested_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <label className="block mb-2 font-medium">Comments (optional):</label>
            <Input.TextArea 
              rows={4} 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments about this decision..."
              disabled={actionLoading}
            />
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-700 flex items-center">
              <span className="mr-2">ℹ️</span>
              {actionType === 'approve'
                ? 'Approving this course will make it available in the course catalog.'
                : 'Rejecting this course will inform the requester that their course was not approved.'}
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ResourceAllocation; 