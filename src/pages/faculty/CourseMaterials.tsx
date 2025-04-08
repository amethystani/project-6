import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Upload, 
  FileText, 
  File, 
  Folder, 
  Search, 
  Plus,
  Download, 
  Eye, 
  Calendar,
  ChevronLeft,
  Clock,
  Users,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Upload as AntUpload, 
  Select, 
  DatePicker, 
  Tabs, 
  Tag, 
  Card,
  Progress,
  Divider,
  message,
  Tooltip,
  Badge,
  Breadcrumb
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../lib/auth';

const { TabPane } = Tabs;
const { Search: SearchInput } = Input;
const { Dragger } = AntUpload;
const { Option } = Select;

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

// Mock data for course materials
const mockMaterials = [
  {
    id: 1,
    course_id: 1,
    title: 'Week 1: Introduction to Java',
    type: 'lecture',
    file_name: 'intro_to_java.pdf',
    file_size: '2.4 MB',
    created_at: '2024-03-10T10:30:00',
    release_date: '2024-03-11T08:00:00',
    is_published: true,
    downloads: 28,
    views: 42
  },
  {
    id: 2,
    course_id: 1,
    title: 'Variables and Data Types',
    type: 'lecture',
    file_name: 'variables_data_types.pptx',
    file_size: '5.7 MB',
    created_at: '2024-03-12T14:20:00',
    release_date: '2024-03-15T08:00:00',
    is_published: true,
    downloads: 22,
    views: 31
  },
  {
    id: 3,
    course_id: 1,
    title: 'Control Structures',
    type: 'lecture',
    file_name: 'control_structures.pdf',
    file_size: '3.1 MB',
    created_at: '2024-03-18T09:15:00',
    release_date: '2024-03-22T08:00:00',
    is_published: false,
    downloads: 0,
    views: 0
  },
  {
    id: 4,
    course_id: 1,
    title: 'Java Style Guide',
    type: 'resource',
    file_name: 'java_style_guide.pdf',
    file_size: '0.8 MB',
    created_at: '2024-03-05T16:45:00',
    release_date: '2024-03-08T08:00:00',
    is_published: true,
    downloads: 35,
    views: 47
  },
  {
    id: 5,
    course_id: 2,
    title: 'Arrays and Linked Lists',
    type: 'lecture',
    file_name: 'arrays_linked_lists.pptx',
    file_size: '4.5 MB',
    created_at: '2024-03-08T11:30:00',
    release_date: '2024-03-10T08:00:00',
    is_published: true,
    downloads: 19,
    views: 34
  },
  {
    id: 6,
    course_id: 3,
    title: 'SQL Basics',
    type: 'lecture',
    file_name: 'sql_basics.pdf',
    file_size: '2.8 MB',
    created_at: '2024-03-15T13:20:00',
    release_date: '2024-03-17T08:00:00',
    is_published: true,
    downloads: 24,
    views: 38
  }
];

// Organizing material types
const materialTypes = [
  { value: 'lecture', label: 'Lecture Slides' },
  { value: 'notes', label: 'Lecture Notes' },
  { value: 'assignment', label: 'Assignment Materials' },
  { value: 'resource', label: 'Additional Resources' },
  { value: 'reading', label: 'Required Readings' }
];

const CourseMaterials = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [materials, setMaterials] = useState(mockMaterials);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { token } = useAuth();

  // Use Effect to initialize
  useEffect(() => {
    // In a real implementation, we would fetch materials from the API
    // Here we're just using mock data
    
    if (selectedCourse) {
      // Filter materials by selected course
      setMaterials(mockMaterials.filter(material => material.course_id === selectedCourse));
    } else {
      setMaterials(mockMaterials);
    }
  }, [selectedCourse]);

  // Filter materials based on search text and active tab
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchText.toLowerCase()) || 
      material.file_name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'published' && material.is_published) || 
      (activeTab === 'unpublished' && !material.is_published);
    
    return matchesSearch && matchesTab;
  });

  // Handle file upload
  const uploadProps = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: UploadFile) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
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

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // In a real implementation, you would upload the file and create a course material record
      console.log('Submitting form with values:', values);
      console.log('Files to upload:', fileList);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      message.success('Course material uploaded successfully!');
      
      // Close the modal and reset form
      setUploadModalVisible(false);
      form.resetFields();
      setFileList([]);
      
      // Add the new material to the list (in a real app, we would fetch the updated list)
      const newMaterial = {
        id: Math.max(...materials.map(m => m.id)) + 1,
        course_id: values.course_id,
        title: values.title,
        type: values.type,
        file_name: fileList[0]?.name || 'unknown_file',
        file_size: fileList[0]?.size ? `${(fileList[0].size / (1024 * 1024)).toFixed(1)} MB` : 'unknown',
        created_at: new Date().toISOString(),
        release_date: values.release_date?.toISOString() || new Date().toISOString(),
        is_published: values.is_published,
        downloads: 0,
        views: 0
      };
      
      setMaterials([...materials, newMaterial]);
    } catch (error) {
      console.error('Error uploading material:', error);
      message.error('Failed to upload course material');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle publish/unpublish toggle
  const handlePublishToggle = (id: number, currentStatus: boolean) => {
    // In a real app, we would call an API to update the status
    const updatedMaterials = materials.map(material => 
      material.id === id ? { ...material, is_published: !currentStatus } : material
    );
    
    setMaterials(updatedMaterials);
    message.success(`Material ${currentStatus ? 'unpublished' : 'published'} successfully`);
  };

  // Function to handle delete
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this material?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // In a real app, we would call an API to delete the material
        const updatedMaterials = materials.filter(material => material.id !== id);
        setMaterials(updatedMaterials);
        message.success('Material deleted successfully');
      }
    });
  };

  // Column definition for the materials table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className="flex items-start">
          <div className="p-2 rounded-lg bg-primary/10 mr-3">
            {record.type === 'lecture' ? <FileText className="h-5 w-5 text-primary" /> : 
             record.type === 'resource' ? <File className="h-5 w-5 text-blue-500" /> :
             record.type === 'assignment' ? <Book className="h-5 w-5 text-green-500" /> :
             <Folder className="h-5 w-5 text-yellow-500" />}
          </div>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-muted-foreground">{record.file_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const materialType = materialTypes.find(t => t.value === type);
        return (
          <Tag color={
            type === 'lecture' ? 'blue' : 
            type === 'resource' ? 'green' : 
            type === 'assignment' ? 'orange' : 'purple'
          }>
            {materialType?.label || type}
          </Tag>
        );
      },
    },
    {
      title: 'Size',
      dataIndex: 'file_size',
      key: 'file_size',
    },
    {
      title: 'Release Date',
      dataIndex: 'release_date',
      key: 'release_date',
      render: (date: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      key: 'is_published',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'Published' : 'Unpublished'}
        </Tag>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: any) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
            {record.views} views
          </div>
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-1 text-muted-foreground" />
            {record.downloads} downloads
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="flex space-x-2">
          <Tooltip title="Download">
            <Button type="text" icon={<Download className="h-4 w-4" />} />
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
          <Breadcrumb.Item>Course Materials</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Book className="h-6 w-6 mr-2 text-primary" />
            Course Materials
          </h1>
          <div className="mt-4 md:mt-0">
            <Button 
              type="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setUploadModalVisible(true)}
            >
              Upload New Material
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
            <label className="block text-sm font-medium mb-1">Material Type</label>
            <Select
              placeholder="All Types"
              className="w-full"
              allowClear
              onChange={(value) => console.log(value)}
            >
              {materialTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-2/4">
            <label className="block text-sm font-medium mb-1">Search</label>
            <SearchInput
              placeholder="Search by title or filename"
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Materials Dashboard */}
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
                All Materials
              </span>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Published
              </span>
            } 
            key="published" 
          />
          <TabPane 
            tab={
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Unpublished
              </span>
            } 
            key="unpublished" 
          />
        </Tabs>
        
        <Table
          dataSource={filteredMaterials}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Material Types" className="shadow-sm">
          <div className="space-y-3">
            {['lecture', 'resource', 'assignment', 'notes', 'reading'].map(type => {
              const count = materials.filter(m => m.type === type).length;
              const percentage = materials.length ? (count / materials.length) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">
                      {materialTypes.find(t => t.value === type)?.label || type}
                    </span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <Progress percent={percentage} showInfo={false} />
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card title="Recent Activity" className="shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <Upload className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">New material uploaded</div>
                <div className="text-sm text-muted-foreground">Variables and Data Types</div>
                <div className="text-xs text-muted-foreground">2 days ago</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Material published</div>
                <div className="text-sm text-muted-foreground">Java Style Guide</div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium">Material deleted</div>
                <div className="text-sm text-muted-foreground">Outdated Assignment Guidelines</div>
                <div className="text-xs text-muted-foreground">1 week ago</div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Student Engagement" className="shadow-sm">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Most Viewed</span>
                <span className="text-sm font-medium">42 views</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">Week 1: Introduction to Java</div>
              <Progress percent={90} showInfo={false} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Most Downloaded</span>
                <span className="text-sm font-medium">35 downloads</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">Java Style Guide</div>
              <Progress percent={85} showInfo={false} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Average Views</span>
                <span className="text-sm font-medium">27 views</span>
              </div>
              <Progress percent={65} showInfo={false} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Upload Material Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-primary" />
            Upload Course Material
          </div>
        }
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_published: true
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
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="E.g., Week 1: Introduction" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Material Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select placeholder="Select Material Type">
              {materialTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="release_date"
            label="Release Date"
          >
            <DatePicker className="w-full" showTime />
          </Form.Item>
          
          <Form.Item
            name="is_published"
            valuePropName="checked"
            label="Publish Status"
          >
            <Select>
              <Option value={true}>Published - Visible to students</Option>
              <Option value={false}>Draft - Not visible to students</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="materials"
            label="Upload Files"
            rules={[{ required: true, message: 'Please upload at least one file' }]}
          >
            <Dragger {...uploadProps} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for PDF, PPTX, DOCX, and other common file formats.
              </p>
            </Dragger>
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setUploadModalVisible(false);
                form.resetFields();
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Upload Material
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseMaterials; 