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
  MessageSquare,
  File,
  FileImage,
  FileText as FileTextIcon
} from 'lucide-react';
import { Button, Form, Input, Modal, Select, Table, Tag, InputNumber, message, Alert, Tabs, Card, Badge, Tooltip, Divider, Upload as AntUpload } from 'antd';
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

interface CourseMaterial {
  id: number;
  title: string;
  type: 'document' | 'video' | 'image' | 'link' | 'assignment';
  url: string;
  uploaded_at: string;
  size?: string;
  description?: string;
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
    id: 101,
    course_code: 'CS101',
    title: 'Introduction to Programming',
    students: 32,
    schedule: 'Mon, Wed 9:00-10:30 AM',
    room: 'Room 201',
    semester: 'Spring 2024',
    status: 'active'
  },
  {
    id: 305,
    course_code: 'CS305',
    title: 'Data Structures and Algorithms',
    students: 28,
    schedule: 'Tue, Thu 1:00-2:30 PM',
    room: 'Room 105',
    semester: 'Spring 2024',
    status: 'active'
  },
  {
    id: 401,
    course_code: 'CS401',
    title: 'Advanced Database Systems',
    students: 22,
    schedule: 'Mon, Wed 2:00-3:30 PM',
    room: 'Room 405',
    semester: 'Spring 2024',
    status: 'active'
  }
];

// Mock data for course materials
const mockCourseMaterials: Record<number, CourseMaterial[]> = {
  101: [
    {
      id: 1,
      title: 'Introduction to Programming Syllabus',
      type: 'document',
      url: '/files/syllabus.pdf',
      uploaded_at: '2024-01-15T10:30:00',
      size: '245 KB',
      description: 'Course syllabus with all requirements and grading criteria'
    },
    {
      id: 2,
      title: 'Week 1 Lecture Slides',
      type: 'document',
      url: '/files/lecture1.pdf',
      uploaded_at: '2024-01-18T14:20:00',
      size: '1.2 MB',
      description: 'Introduction to programming concepts'
    },
    {
      id: 3,
      title: 'Python Installation Guide',
      type: 'document',
      url: '/files/python_guide.pdf',
      uploaded_at: '2024-01-20T09:15:00',
      size: '560 KB',
      description: 'Step-by-step guide for installing Python'
    }
  ],
  305: [
    {
      id: 4,
      title: 'Data Structures Course Outline',
      type: 'document',
      url: '/files/ds_outline.pdf',
      uploaded_at: '2024-01-10T11:45:00',
      size: '320 KB',
      description: 'Complete course outline for the semester'
    },
    {
      id: 5,
      title: 'Big-O Notation Video',
      type: 'video',
      url: 'https://example.com/videos/bigo',
      uploaded_at: '2024-01-25T15:30:00',
      description: 'Video lecture explaining Big-O notation'
    }
  ],
  401: [
    {
      id: 6,
      title: 'Database Systems Syllabus',
      type: 'document',
      url: '/files/db_syllabus.pdf',
      uploaded_at: '2024-01-12T13:20:00',
      size: '275 KB',
      description: 'Course syllabus with requirements and schedule'
    }
  ]
};

const CourseManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<CurrentCourse[]>(mockCurrentCourses);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CurrentCourse | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [isMaterialsModalVisible, setIsMaterialsModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [materialForm] = Form.useForm();
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

  // Function to open course materials modal
  const showMaterialsModal = (course: CurrentCourse) => {
    setSelectedCourse(course);
    // Load course materials from mock data
    setCourseMaterials(mockCourseMaterials[course.id] || []);
    setIsMaterialsModalVisible(true);
  };

  // Function to handle file upload
  const handleFileUpload = () => {
    materialForm.validateFields().then(values => {
      setUploadLoading(true);
      
      // Simulate upload delay
      setTimeout(() => {
        // Create new material
        const newMaterial: CourseMaterial = {
          id: Date.now(), // Use timestamp as temporary ID
          title: values.title,
          type: 'document',
          url: '/files/uploaded_document.pdf', // Mock URL
          uploaded_at: new Date().toISOString(),
          size: '320 KB', // Mock size
          description: values.description
        };
        
        // Add to the list
        const updatedMaterials = [...courseMaterials, newMaterial];
        setCourseMaterials(updatedMaterials);
        
        // Update mock data
        if (selectedCourse) {
          mockCourseMaterials[selectedCourse.id] = updatedMaterials;
        }
        
        // Reset form
        materialForm.resetFields();
        message.success('File uploaded successfully');
        setUploadLoading(false);
      }, 1500);
    });
  };
  
  // Function to delete a material
  const handleDeleteMaterial = (materialId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this material?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        const updatedMaterials = courseMaterials.filter(material => material.id !== materialId);
        setCourseMaterials(updatedMaterials);
        
        // Update mock data
        if (selectedCourse) {
          mockCourseMaterials[selectedCourse.id] = updatedMaterials;
        }
        
        message.success('Material deleted successfully');
      }
    });
  };
  
  // Function to get icon based on material type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <FileTextIcon className="h-5 w-5 text-red-500" />;
      case 'image':
        return <FileImage className="h-5 w-5 text-green-500" />;
      case 'link':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
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
            <Button 
              type="text" 
              icon={<FileText className="h-4 w-4" />} 
              onClick={() => showMaterialsModal(record)}
            />
          </Tooltip>
          <Tooltip title="Manage Grades">
            <Link to="/dashboard/grade-entry">
              <Button type="text" icon={<Edit className="h-4 w-4" />} />
            </Link>
          </Tooltip>
          <Tooltip title="Manage Attendance">
            <Link to={`/dashboard/course-management/attendance/${record.id}`}>
              <Button type="text" icon={<Users className="h-4 w-4" />} />
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

      {/* Course Materials Modal */}
      <Modal
        title={selectedCourse ? `Materials for ${selectedCourse.course_code}: ${selectedCourse.title}` : 'Course Materials'}
        open={isMaterialsModalVisible}
        onCancel={() => setIsMaterialsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="view" className="mt-4">
          <TabPane tab="View Materials" key="view">
            {courseMaterials.length === 0 ? (
              <Alert
                message="No Materials"
                description="There are no materials uploaded for this course yet."
                type="info"
                showIcon
                className="my-4"
              />
            ) : (
              <div className="mt-4">
                <Input 
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                  placeholder="Search materials..."
                  className="mb-4"
                />
                
                <div className="overflow-y-auto max-h-[400px]">
                  {courseMaterials.map(material => (
                    <div key={material.id} className="border rounded-md p-4 mb-3 hover:border-blue-400 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="p-2 bg-gray-100 rounded-md mr-3">
                            {getMaterialIcon(material.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{material.title}</h3>
                            <p className="text-gray-500 text-sm mt-1">{material.description}</p>
                            <div className="flex items-center text-gray-500 text-xs mt-2">
                              <span>Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}</span>
                              {material.size && <span className="ml-3">Size: {material.size}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            type="text" 
                            icon={<Download className="h-4 w-4" />}
                            title="Download"
                          />
                          <Button 
                            type="text" 
                            icon={<Trash2 className="h-4 w-4 text-red-500" />}
                            title="Delete"
                            onClick={() => handleDeleteMaterial(material.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabPane>
          
          <TabPane tab="Upload New Material" key="upload">
            <Form
              form={materialForm}
              layout="vertical"
              className="mt-4"
            >
              <Form.Item
                name="title"
                label="Material Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="e.g., Week 3 Lecture Slides" />
              </Form.Item>
              
              <Form.Item
                name="file"
                label="File"
                rules={[{ required: true, message: 'Please select a file to upload' }]}
              >
                <AntUpload.Dragger
                  name="file"
                  multiple={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  onChange={(info: any) => {
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} file uploaded successfully`);
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} file upload failed.`);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <Upload className="h-8 w-8" />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF, DOCX, PPTX, JPG, PNG files.
                  </p>
                </AntUpload.Dragger>
              </Form.Item>
              
              <Form.Item
                name="type"
                label="Material Type"
                initialValue="document"
              >
                <Select>
                  <Option value="document">Document</Option>
                  <Option value="video">Video</Option>
                  <Option value="image">Image</Option>
                  <Option value="link">Link</Option>
                  <Option value="assignment">Assignment</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={3} placeholder="Brief description of this material" />
              </Form.Item>
              
              <Form.Item className="mb-0 flex justify-end">
                <Button 
                  type="primary" 
                  onClick={handleFileUpload}
                  loading={uploadLoading}
                >
                  Upload Material
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default CourseManagement; 