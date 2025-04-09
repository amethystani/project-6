import React, { useState, useEffect } from 'react';
import { Card, Tabs, Select, Table, Tag, Button, Tooltip, message, Modal, Space, Input, Alert } from 'antd';
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
  course?: Course;
  
  // Fields that may be present in flattened response format
  course_code?: string;
  course_name?: string;
  description?: string;
  department?: string;
  credits?: number;
  
  requested_by: number;
  submitted_by?: number; // Alternative field name used in some API responses
  approved_by: number | null;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  comment?: string; // Alternative field name used in some API responses
  requested_at?: string;
  created_at?: string; // Alternative field name used in some API responses
  updated_at: string;
  
  // Additional fields that might be present in some responses
  submitted_by_name?: string;
  approved_by_name?: string;
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
  
  // Cache for responses by status to improve performance
  const [responseCache, setResponseCache] = useState<{[key: string]: CourseApproval[]}>({});
  
  // Last successful endpoint by status to optimize future requests
  const [successfulEndpoints, setSuccessfulEndpoints] = useState<{[key: string]: string}>({});

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('Fetching course approvals...');
      
      // Try course approvals endpoint first
      try {
        const response = await axios.get(`${apiUrl}/api/courses/course-approvals?_t=${Date.now()}`);
        
        if (response.data && response.data.data) {
          console.log('Course approvals loaded:', response.data.data);
          setCourseApprovals(response.data.data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching from primary endpoint:', error);
        // Continue to fallback
      }
      
      // Try catalog endpoint as fallback
      try {
        const response = await axios.get(`${apiUrl}/api/courses/catalog/course-approvals?_t=${Date.now()}`);
        
        if (response.data && response.data.data) {
          console.log('Course approvals loaded from catalog endpoint:', response.data.data);
          setCourseApprovals(response.data.data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching from catalog endpoint:', error);
        message.error('Failed to load course approvals. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching course approvals:', error);
      message.error('Failed to load course approvals. Please refresh the page or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`Status filter changed to '${selectedStatus}', fetching approvals...`);
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
    console.log(`Changing filter from '${selectedStatus}' to '${value}'`);
    setSelectedStatus(value);
  };

  const showCommentModal = (approval: CourseApproval, type: 'approve' | 'reject') => {
    console.log(`Showing ${type} modal for approval:`, approval);
    setCurrentApproval(approval);
    setActionType(type);
    setComment(''); // Reset comment field
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
    
    // Message key for unified notifications
    const messageKey = 'approvalAction';
    
    try {
      message.loading({
        content: `Processing ${actionType} request...`,
        key: messageKey,
        duration: 0
      });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      console.log(`Processing ${actionType} action for approval ID ${currentApproval.id}`);
      
      // First try the direct-action endpoint with GET
      const directUrl = `${apiUrl}/api/courses/direct-action/${currentApproval.id}?action=${actionType}&t=${Date.now()}`;
      console.log(`Using direct action URL: ${directUrl}`);
      
      try {
        const response = await fetch(directUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Direct action response:', data);
          
          message.success({
            content: `Course ${currentApproval.course?.course_code || currentApproval.course_code || 'request'} has been ${actionType === 'approve' ? 'APPROVED' : 'REJECTED'} successfully!`,
            duration: 5,
            key: messageKey
          });
          
          // Clear current approval and close modal
          setCurrentApproval(null);
          setCommentModalVisible(false);
          setComment('');
          
          // Refresh the data
          await fetchCourseApprovals();
          return;
        } else {
          console.error(`Direct action failed: ${response.status} ${response.statusText}`);
          throw new Error(`Server returned status ${response.status}`);
        }
      } catch (error) {
        console.error('Error with direct action endpoint:', error);
        
        // Try the simplified endpoint as a fallback
        try {
          console.log('Trying simplified endpoint as fallback...');
          const simpleUrl = `${apiUrl}/api/courses/simple-approve/${currentApproval.id}?action=${actionType}&t=${Date.now()}`;
          
          const simpleResponse = await fetch(simpleUrl);
          
          if (simpleResponse.ok) {
            const data = await simpleResponse.json();
            console.log('Simple endpoint response:', data);
            
            message.success({
              content: `Course ${currentApproval.course?.course_code || currentApproval.course_code || 'request'} has been ${actionType === 'approve' ? 'APPROVED' : 'REJECTED'} successfully!`,
              duration: 5,
              key: messageKey
            });
            
            // Clear current approval and close modal
            setCurrentApproval(null);
            setCommentModalVisible(false);
            setComment('');
            
            // Refresh the data
            await fetchCourseApprovals();
            return;
          } else {
            const errorText = await simpleResponse.text();
            console.error(`Simple endpoint failed: ${simpleResponse.status} ${errorText}`);
            throw new Error(`Simplified endpoint returned status ${simpleResponse.status}`);
          }
        } catch (fallbackError) {
          console.error('Error with simplified endpoint:', fallbackError);
          message.error({
            content: `Failed to ${actionType} course. Please try again later.`,
            duration: 5,
            key: messageKey
          });
        }
      }
    } catch (error: any) {
      console.error(`Error during ${actionType} action:`, error);
      
      message.error({
        content: error.message || `An error occurred during the ${actionType} action.`,
        duration: 5,
        key: messageKey
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
      key: 'course_code',
      width: '10%',
      render: (_: any, record: CourseApproval) => {
        // Handle different response formats
        if (record.course?.course_code) {
          return record.course.course_code;
        } else if (record.course_code) {
          return record.course_code;
        } else {
          return 'N/A';
        }
      }
    },
    {
      title: 'Title',
      key: 'title',
      width: '15%',
      render: (_: any, record: CourseApproval) => {
        if (record.course?.title) {
          return record.course.title;
        } else if (record.course_name) {
          return record.course_name;
        } else {
          return 'N/A';
        }
      }
    },
    {
      title: 'Description',
      key: 'description',
      width: '12%',
      ellipsis: true,
      render: (_: any, record: CourseApproval) => {
        const description = record.course?.description || record.description || 'N/A';
        return (
          <Tooltip placement="topLeft" title={description}>
            {description}
          </Tooltip>
        );
      }
    },
    {
      title: 'Department',
      key: 'department',
      width: '15%',
      render: (_: any, record: CourseApproval) => {
        return record.course?.department || record.department || 'N/A';
      }
    },
    {
      title: 'Credits',
      key: 'credits',
      width: '8%',
      render: (_: any, record: CourseApproval) => {
        return record.course?.credits || record.credits || 'N/A';
      }
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
              onClick={() => {
                // Force a refresh by clearing cache for current status
                const newCache = {...responseCache};
                delete newCache[selectedStatus];
                setResponseCache(newCache);
                fetchCourseApprovals();
              }}
              loading={loading}
            >
              Refresh
            </Button>
            <Select 
              value={selectedStatus} 
              onChange={handleStatusChange}
              style={{ width: 120 }}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' }
              ]}
            />
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
            key={`course-table-${selectedStatus}-${courseApprovals.length}`} // Add length to force re-render
          />
        </div>
        
        <Modal
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Course Request`}
          open={commentModalVisible}
          onOk={handleAction}
          onCancel={handleCancel}
          okText={actionType === 'approve' ? 'Approve' : 'Reject'}
          okButtonProps={{ 
            loading: actionLoading,
            danger: actionType === 'reject',
            style: { 
              backgroundColor: actionType === 'approve' ? '#1DA57A' : undefined,
              borderColor: actionType === 'approve' ? '#1DA57A' : undefined,
            }
          }}
          cancelButtonProps={{ disabled: actionLoading }}
        >
          <div className="mb-4">
            <div className="font-bold mb-1">{currentApproval?.course?.course_code || currentApproval?.course_code || 'Course'}</div>
            <div>{currentApproval?.course?.title || 'Title not available'}</div>
            <div className="text-sm text-gray-500">
              Department: {currentApproval?.course?.department || currentApproval?.department || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              Credits: {currentApproval?.course?.credits || currentApproval?.credits || 'N/A'}
            </div>
          </div>

          <Alert
            message={`Are you sure you want to ${actionType} this course?`}
            type={actionType === 'approve' ? 'success' : 'error'}
            showIcon
            className="mb-4"
          />

          <div className="mb-4">
            <label className="block text-sm mb-1">Add Comments (Optional):</label>
            <Input.TextArea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments or reasons for this decision..."
              maxLength={500}
              disabled={actionLoading}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ResourceAllocation; 