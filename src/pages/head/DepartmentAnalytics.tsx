import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Alert, Button } from 'antd';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChartIcon, Users, BookOpen, Award, TrendingUp, RefreshCw } from 'lucide-react';

interface DepartmentAnalyticsData {
  department: string;
  course_statistics: {
    total_courses: number;
    active_courses: number;
    inactive_courses: number;
  };
  enrollment_statistics: {
    total_enrollments: number;
  };
  faculty_statistics: {
    total_faculty: number;
  };
  approval_statistics: {
    pending: number;
    approved: number;
    rejected: number;
  };
  popular_courses: Array<{
    course: {
      id: number;
      course_code: string;
      title: string;
      credits: number;
      department: string;
    };
    enrollment_count: number;
  }>;
}

const DepartmentAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DepartmentAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/department-head/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setAnalyticsData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      setError('An error occurred while fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading department analytics..." />
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
            <Button size="small" type="primary" onClick={fetchAnalyticsData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-4">
        <Alert
          message="No Data"
          description="No analytics data available. Please try again later."
          type="info"
          showIcon
        />
      </div>
    );
  }

  // Prepare data for charts
  const courseStatusData = [
    { name: 'Active Courses', value: analyticsData.course_statistics.active_courses },
    { name: 'Inactive Courses', value: analyticsData.course_statistics.inactive_courses }
  ];

  const approvalStatusData = [
    { name: 'Pending', value: analyticsData.approval_statistics.pending },
    { name: 'Approved', value: analyticsData.approval_statistics.approved },
    { name: 'Rejected', value: analyticsData.approval_statistics.rejected }
  ];

  const popularCoursesData = analyticsData.popular_courses.map(item => ({
    name: item.course.course_code,
    enrollments: item.enrollment_count,
    title: item.course.title
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const popularCoursesColumns = [
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
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
    },
    {
      title: 'Enrollments',
      dataIndex: 'enrollment_count',
      key: 'enrollment_count',
      render: (count: number) => <Tag color="blue">{count} students</Tag>,
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <BarChartIcon className="mr-2 h-6 w-6 text-primary" />
          Department Analytics: {analyticsData.department}
        </h1>
        <Button 
          onClick={fetchAnalyticsData} 
          icon={<RefreshCw size={16} className="mr-1" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Key Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-blue-500" /> Total Courses</span>}
                value={analyticsData.course_statistics.total_courses}
                valueStyle={{ color: '#0088FE' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="flex items-center"><Users className="mr-2 h-5 w-5 text-green-500" /> Faculty Members</span>}
                value={analyticsData.faculty_statistics.total_faculty}
                valueStyle={{ color: '#00C49F' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="flex items-center"><Award className="mr-2 h-5 w-5 text-yellow-500" /> Course Enrollments</span>}
                value={analyticsData.enrollment_statistics.total_enrollments}
                valueStyle={{ color: '#FFBB28' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-purple-500" /> Active Courses</span>}
                value={analyticsData.course_statistics.active_courses}
                suffix={`/ ${analyticsData.course_statistics.total_courses}`}
                valueStyle={{ color: '#8884D8' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <Row gutter={[24, 24]}>
          {/* Course Status Chart */}
          <Col xs={24} sm={24} md={12}>
            <Card 
              title="Course Status Distribution" 
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {courseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} courses`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Approval Status Chart */}
          <Col xs={24} sm={24} md={12}>
            <Card 
              title="Course Approval Status" 
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={approvalStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {approvalStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} requests`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Popular Courses Bar Chart */}
      <div className="mb-8">
        <Card 
          title="Most Popular Courses by Enrollment" 
          bordered={false}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularCoursesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`${value} students`, 'Enrollments']}
                  labelFormatter={(label) => {
                    const course = popularCoursesData.find(c => c.name === label);
                    return `${label}: ${course?.title}`;
                  }}
                />
                <Legend />
                <Bar dataKey="enrollments" fill="#8884D8">
                  {popularCoursesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Popular Courses Table */}
      <div>
        <Card 
          title="Course Enrollment Details" 
          bordered={false}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Table 
            dataSource={analyticsData.popular_courses} 
            columns={popularCoursesColumns}
            rowKey={(record) => record.course.id.toString()}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default DepartmentAnalytics; 