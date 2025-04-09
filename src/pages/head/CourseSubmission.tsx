import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Card, Select, message, Alert } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const departments = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Business',
  'Economics',
  'English',
  'History',
  'Psychology',
  'Sociology',
  'Art',
  'Music'
];

interface CourseFormData {
  course_code: string;
  title: string;
  description: string;
  credits: number;
  department: string;
  prerequisites: string;
  capacity: number;
}

const CourseSubmission: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onFinish = async (values: CourseFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use hardcoded API URL if environment variable isn't available
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      console.log('Submitting course data:', values);
      
      // Try multiple endpoints in sequence
      const endpoints = [
        `${apiUrl}/api/department-head/simple-course-submit`,
        `${apiUrl}/api/courses/department-head/simple-course-submit`,
        `${apiUrl}/api/department-head/course-request-simple`
      ];
      
      let response = null;
      let endpointSuccess = false;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          // Add timestamp to URL to prevent caching
          const timestampedUrl = `${endpoint}?_t=${new Date().getTime()}`;
          
          response = await axios.post(
            timestampedUrl,
            values,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 15000 // 15 second timeout
            }
          );
          
          console.log(`Response from ${endpoint}:`, response.data);
          
          if (response.data && response.data.status === 'success') {
            endpointSuccess = true;
            break;
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
          // Continue to next endpoint
        }
      }
      
      if (endpointSuccess && response) {
        setSuccess(`Course "${values.title}" has been submitted successfully and is awaiting approval.`);
        message.success('Course submitted successfully');
        form.resetFields();
      } else {
        throw new Error('All endpoints failed');
      }
    } catch (err: any) {
      console.error('Error submitting course:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Server error, please try again';
        setError(`Submission failed: ${errorMessage}`);
        message.error(errorMessage);
      } else if (err.request) {
        setError('No response received from server. Please check your network connection and try again.');
        message.error('Network error, please try again');
      } else {
        setError(`Error: ${err.message}`);
        message.error('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Card title="Submit New Course" className="mb-4 max-w-3xl mx-auto">
        <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-700">
            Complete this form to submit a new course for approval. All fields marked with an asterisk (*) are required.
          </p>
        </div>
        
        {error && (
          <Alert
            message="Submission Error"
            description={error}
            type="error"
            className="mb-4"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}
        
        {success && (
          <Alert
            message="Course Submitted Successfully"
            description={success}
            type="success"
            className="mb-4"
            showIcon
            closable
            onClose={() => setSuccess(null)}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            credits: 3,
            capacity: 30
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="course_code"
              label="Course Code"
              rules={[
                { required: true, message: 'Please enter the course code' },
                { max: 10, message: 'Course code cannot exceed 10 characters' }
              ]}
            >
              <Input placeholder="E.g., CS101" />
            </Form.Item>
            
            <Form.Item
              name="title"
              label="Course Title"
              rules={[
                { required: true, message: 'Please enter the course title' },
                { max: 100, message: 'Title cannot exceed 100 characters' }
              ]}
            >
              <Input placeholder="E.g., Introduction to Computer Science" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="description"
            label="Course Description"
            rules={[
              { required: true, message: 'Please enter a course description' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Provide a detailed description of the course"
            />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="credits"
              label="Credits"
              rules={[
                { required: true, message: 'Please specify the number of credits' },
                { type: 'number', min: 1, max: 12, message: 'Credits must be between 1 and 12' }
              ]}
            >
              <InputNumber min={1} max={12} />
            </Form.Item>
            
            <Form.Item
              name="department"
              label="Department"
              rules={[
                { required: true, message: 'Please select a department' }
              ]}
            >
              <Select placeholder="Select department">
                {departments.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="capacity"
              label="Maximum Capacity"
              rules={[
                { required: true, message: 'Please specify the maximum capacity' },
                { type: 'number', min: 5, max: 500, message: 'Capacity must be between 5 and 500' }
              ]}
            >
              <InputNumber min={5} max={500} />
            </Form.Item>
          </div>
          
          <Form.Item
            name="prerequisites"
            label="Prerequisites"
          >
            <TextArea
              rows={2}
              placeholder="E.g., CS100, MATH101 (leave blank if none)"
            />
          </Form.Item>
          
          <Form.Item
            name="comments"
            label="Additional Comments"
          >
            <TextArea
              rows={3}
              placeholder="Any additional information or justification for this course"
            />
          </Form.Item>
          
          <Form.Item className="mt-6">
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitting}
              size="large"
              className="w-full md:w-auto"
            >
              Submit Course for Approval
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CourseSubmission; 