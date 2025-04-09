import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { Card, Tabs, Table, Tag, Button, Spin, Alert, List, Typography, Space, Steps, Collapse, Divider, Modal, Form, Input, Select } from 'antd';
import { ClipboardCheck, FileText, Check, X, AlertTriangle, Calendar, User, MessageSquare, RefreshCw, Filter, ChevronDown, Plus } from 'lucide-react';
import type { ColumnType, Key } from 'antd/es/table/interface';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

interface CourseApproval {
  id: number;
  course_id: number;
  course: {
    id: number;
    course_code: string;
    title: string;
    description: string;
    credits: number;
    department: string;
    prerequisites: string;
    capacity: number;
    is_active: boolean;
  };
  requested_by: number;
  approved_by: number | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  requested_at: string;
  updated_at: string;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const ApprovalsPolicy: React.FC = () => {
  const [approvals, setApprovals] = useState<CourseApproval[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('approvals');
  const [isPolicyModalVisible, setIsPolicyModalVisible] = useState<boolean>(false);
  const [selectedApproval, setSelectedApproval] = useState<CourseApproval | null>(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState<boolean>(false);
  const [approvalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newPolicyForm] = Form.useForm();
  const [creatingPolicy, setCreatingPolicy] = useState<boolean>(false);
  const { token } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Fetch approvals
      const approvalsResponse = await axios.get(`${apiUrl}/api/department-head/course-approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch policies
      const policiesResponse = await axios.get(`${apiUrl}/api/department-head/policy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (approvalsResponse.data.status === 'success' && policiesResponse.data.status === 'success') {
        setApprovals(approvalsResponse.data.data);
        setPolicies(policiesResponse.data.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApproval = async (values: any) => {
    if (!selectedApproval) {
      console.error('No approval selected');
      return;
    }
    
    console.log('Handling approval update:', values);
    console.log('Selected approval:', selectedApproval);
    
    setSubmitting(true);
    try {
      // Simplify payload
      const payload = {
        status: values.status,
        comments: values.comments || ''
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log(`Updating approval ${selectedApproval.id} with status: ${payload.status}`);
      
      // Use simplified payload and clear headers
      const response = await axios.put(
        `${apiUrl}/api/department-head/course-approvals/${selectedApproval.id}`,
        payload,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update approval response:', response.data);
      
      if (response.data.status === 'success') {
        // Update the approval in the state
        setApprovals(prevApprovals => 
          prevApprovals.map(approval => 
            approval.id === selectedApproval.id 
              ? { ...approval, status: values.status, comments: values.comments || '' }
              : approval
          )
        );
        
        // Show success message
        Modal.success({
          title: 'Course Updated',
          content: `The course ${selectedApproval.course.course_code} has been ${values.status === 'approved' ? 'approved' : 'rejected'}.`
        });
        
        setApprovalModalVisible(false);
        approvalForm.resetFields();
        fetchData();
      } else {
        Modal.error({
          title: 'Update Failed',
          content: response.data.message || 'Failed to update approval'
        });
      }
    } catch (error: any) {
      console.error('Error updating approval:', error);
      
      let errorMessage = 'An error occurred while updating the approval';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      }
      
      Modal.error({
        title: 'Update Failed',
        content: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePolicy = async (values: any) => {
    setCreatingPolicy(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await axios.post(
        `${apiUrl}/api/department-head/policy`,
        {
          title: values.title,
          description: values.description,
          content: values.content,
          department: 'Computer Science' // In a real app, get this from the user's profile
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Add the new policy to the state
        setPolicies([response.data.data, ...policies]);
        
        setIsPolicyModalVisible(false);
        newPolicyForm.resetFields();
        
        // Show success notification
        Modal.success({
          title: 'Policy Created',
          content: 'The policy was successfully created and is now in effect.',
        });
      } else {
        setError(response.data.message || 'Failed to create policy');
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      setError('An error occurred while creating the policy');
    } finally {
      setCreatingPolicy(false);
    }
  };

  const handleEditPolicy = async (policyId: number, editedValues: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await axios.put(
        `${apiUrl}/api/department-head/policy/${policyId}`,
        {
          title: editedValues.title,
          description: editedValues.description,
          content: editedValues.content
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the policy in the state
        setPolicies(prevPolicies => 
          prevPolicies.map(policy => 
            policy.id === policyId 
              ? response.data.data
              : policy
          )
        );
        
        // Show success notification
        Modal.success({
          title: 'Policy Updated',
          content: 'The policy was successfully updated.',
        });
      } else {
        setError(response.data.message || 'Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      setError('An error occurred while updating the policy');
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading approvals and policies..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'pending':
        return <Tag icon={<AlertTriangle size={12} />} color="orange">Pending</Tag>;
      case 'approved':
        return <Tag icon={<Check size={12} />} color="green">Approved</Tag>;
      case 'rejected':
        return <Tag icon={<X size={12} />} color="red">Rejected</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getStepStatus = (status: string) => {
    switch(status) {
      case 'pending': return 'process';
      case 'approved': return 'finish';
      case 'rejected': return 'error';
      default: return 'wait';
    }
  };

  const approvalColumns = [
    {
      title: 'Course Code',
      dataIndex: ['course', 'course_code'],
      key: 'course_code',
      render: (text: string) => <strong>{text}</strong>
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
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value: Key | boolean, record: CourseApproval) => 
        record.status === value,
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: CourseApproval, b: CourseApproval) => 
        new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseApproval) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            disabled={record.status !== 'pending'}
            onClick={() => {
              console.log('Review button clicked for record:', record);
              setSelectedApproval(record);
              
              // Reset form and set initial values explicitly
              approvalForm.resetFields();
              
              // Set default values for the form
              setTimeout(() => {
                approvalForm.setFieldsValue({
                  status: 'approved',
                  comments: ''
                });
                console.log('Form initialized with values:', approvalForm.getFieldsValue());
              }, 100);
              
              setApprovalModalVisible(true);
            }}
          >
            Review
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              Modal.info({
                title: `${record.course.course_code}: ${record.course.title}`,
                content: (
                  <div>
                    <p><strong>Description:</strong> {record.course.description}</p>
                    <p><strong>Department:</strong> {record.course.department}</p>
                    <p><strong>Credits:</strong> {record.course.credits}</p>
                    <p><strong>Prerequisites:</strong> {record.course.prerequisites || 'None'}</p>
                    <p><strong>Capacity:</strong> {record.course.capacity}</p>
                    <p><strong>Status:</strong> {getStatusTag(record.status)}</p>
                    {record.comments && <p><strong>Comments:</strong> {record.comments}</p>}
                  </div>
                ),
                width: 600,
              });
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <ClipboardCheck className="mr-2 h-6 w-6 text-primary" />
            Approvals & Policy
          </h1>
        </div>
        <Space>
          <Button 
            onClick={fetchData} 
            icon={<RefreshCw size={16} className="mr-1" />}
          >
            Refresh Data
          </Button>
          {activeTab === 'policy' && (
            <Button 
              type="primary"
              icon={<Plus size={16} className="mr-1" />}
              onClick={() => setIsPolicyModalVisible(true)}
            >
              New Policy
            </Button>
          )}
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="mb-6"
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <ClipboardCheck className="mr-1 h-4 w-4" /> Course Approvals
            </span>
          } 
          key="approvals"
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Course Approval Requests</Title>
              <div className="flex items-center">
                <Text className="mr-2">Filter: </Text>
                <Button icon={<Filter size={16} className="mr-1" />}>
                  Status <ChevronDown size={16} className="ml-1" />
                </Button>
              </div>
            </div>
            
            <Table 
              dataSource={approvals} 
              columns={approvalColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>

          <div className="mt-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Title level={4}>Approval Process</Title>
              <Paragraph className="text-gray-500 mb-4">
                The course approval workflow ensures that all new courses meet department standards and requirements.
              </Paragraph>

              <Steps
                current={1}
                items={[
                  {
                    title: 'Submission',
                    description: 'Faculty submits course proposal',
                    status: 'finish',
                  },
                  {
                    title: 'Department Review',
                    description: 'Department head reviews proposal',
                    status: 'process',
                  },
                  {
                    title: 'Academic Approval',
                    description: 'Academic committee reviews',
                    status: 'wait',
                  },
                  {
                    title: 'Implementation',
                    description: 'Course is added to catalog',
                    status: 'wait',
                  },
                ]}
              />
            </Card>
          </div>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center">
              <FileText className="mr-1 h-4 w-4" /> Department Policies
            </span>
          } 
          key="policy"
        >
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Title level={4}>Department Policies</Title>
            <Paragraph className="text-gray-500 mb-4">
              Official policies governing department operations, course management, and faculty responsibilities.
            </Paragraph>

            <Collapse 
              bordered={false} 
              className="bg-transparent"
              expandIconPosition="right"
            >
              {policies.map(policy => (
                <Panel
                  key={policy.id}
                  header={
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">{policy.title}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  }
                  className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-2">
                    <div className="mb-3">
                      <Text strong>Description:</Text>
                      <Paragraph>{policy.description}</Paragraph>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    <div>
                      <Text strong>Policy Details:</Text>
                      <Paragraph className="whitespace-pre-wrap mt-2">{policy.content}</Paragraph>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Space>
                        <Button 
                          size="small" 
                          onClick={() => {
                            // Create a modal with a form for editing the policy
                            const editForm = Modal.confirm({
                              title: `Edit Policy: ${policy.title}`,
                              width: 600,
                              icon: null,
                              content: (
                                <Form
                                  initialValues={{
                                    title: policy.title,
                                    description: policy.description,
                                    content: policy.content
                                  }}
                                  layout="vertical"
                                  onFinish={(values) => {
                                    handleEditPolicy(policy.id, values);
                                    editForm.destroy();
                                  }}
                                >
                                  <Form.Item
                                    label="Policy Title"
                                    name="title"
                                    rules={[{ required: true, message: 'Please enter a policy title' }]}
                                  >
                                    <Input placeholder="Policy title" />
                                  </Form.Item>
                                  
                                  <Form.Item
                                    label="Description"
                                    name="description"
                                    rules={[{ required: true, message: 'Please enter a description' }]}
                                  >
                                    <Input placeholder="Brief description of the policy" />
                                  </Form.Item>
                                  
                                  <Form.Item
                                    label="Policy Content"
                                    name="content"
                                    rules={[{ required: true, message: 'Please enter policy content' }]}
                                  >
                                    <TextArea rows={6} placeholder="Detailed policy content..." />
                                  </Form.Item>
                                </Form>
                              ),
                              okText: 'Save Changes',
                              cancelText: 'Cancel',
                              onOk: () => {
                                // This is handled by the form's onFinish
                              },
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="small" type="primary">Share</Button>
                      </Space>
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          </Card>

          <div className="mt-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Title level={4}>Policy Implementation Timeline</Title>
              <List
                itemLayout="horizontal"
                dataSource={policies}
                renderItem={(policy) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Calendar className="h-8 w-8 p-1 bg-primary/10 text-primary rounded" />}
                      title={<span>{policy.title}</span>}
                      description={
                        <div>
                          <p className="text-gray-500">{policy.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Text type="secondary">Implemented: {new Date(policy.created_at).toLocaleDateString()}</Text>
                            <Divider type="vertical" />
                            <Text type="secondary">Last Updated: {new Date(policy.updated_at).toLocaleDateString()}</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </TabPane>
      </Tabs>

      {/* Policy Creation Modal */}
      <Modal
        title="Create New Policy"
        open={isPolicyModalVisible}
        onCancel={() => setIsPolicyModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form 
          form={newPolicyForm}
          layout="vertical"
          onFinish={handleCreatePolicy}
        >
          <Form.Item
            label="Policy Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a policy title' }]}
          >
            <Input placeholder="e.g., Course Creation Guidelines" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Brief description of the policy" />
          </Form.Item>
          
          <Form.Item
            label="Policy Content"
            name="content"
            rules={[{ required: true, message: 'Please enter policy content' }]}
          >
            <TextArea rows={6} placeholder="Detailed policy content..." />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setIsPolicyModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creatingPolicy}>
                Create Policy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Approval Review Modal */}
      <Modal
        title={`Review Course: ${selectedApproval?.course?.course_code || ''}`}
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedApproval && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{selectedApproval.course.title}</h3>
              <p className="text-gray-500">{selectedApproval.course.description}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Text type="secondary">Department:</Text>
                  <div>{selectedApproval.course.department}</div>
                </div>
                <div>
                  <Text type="secondary">Credits:</Text>
                  <div>{selectedApproval.course.credits}</div>
                </div>
                <div>
                  <Text type="secondary">Prerequisites:</Text>
                  <div>{selectedApproval.course.prerequisites || 'None'}</div>
                </div>
                <div>
                  <Text type="secondary">Capacity:</Text>
                  <div>{selectedApproval.course.capacity}</div>
                </div>
              </div>
            </div>

            <Form
              form={approvalForm}
              layout="vertical"
              onFinish={handleUpdateApproval}
            >
              <Form.Item
                name="status"
                label="Decision"
                rules={[{ required: true, message: 'Please select a decision' }]}
                initialValue="approved"
              >
                <Select placeholder="Select your decision">
                  <Option value="approved">Approve</Option>
                  <Option value="rejected">Reject</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="comments"
                label="Comments"
              >
                <TextArea rows={4} placeholder="Provide feedback or reasons for your decision..." />
              </Form.Item>
              
              <Form.Item className="flex justify-end">
                <Space>
                  <Button onClick={() => setApprovalModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    onClick={() => {
                      console.log('Submit button clicked, form values:', approvalForm.getFieldsValue());
                    }}
                  >
                    Submit Decision
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalsPolicy; 