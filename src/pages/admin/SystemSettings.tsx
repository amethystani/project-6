import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  FileText,
  HardDrive,
  Clock,
  Calendar,
  Globe,
  Save,
  RefreshCw,
  Cloud,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Tabs, Form, Input, Switch, Select, Button, Card, Divider, InputNumber, TimePicker, DatePicker, Space, Tooltip, message, Radio } from 'antd';
import type { TabsProps } from 'antd';

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { TabPane } = Tabs;

  const handleGeneralSubmit = (values: any) => {
    setLoading(true);
    // In a real app, you would save these settings to the backend
    console.log('General settings:', values);
    setTimeout(() => {
      message.success('General settings saved successfully');
      setLoading(false);
    }, 500);
  };

  const handleBackupSubmit = (values: any) => {
    setLoading(true);
    // In a real app, you would save these settings to the backend
    console.log('Backup settings:', values);
    setTimeout(() => {
      message.success('Backup settings saved successfully');
      setLoading(false);
    }, 500);
  };

  const handleSecuritySubmit = (values: any) => {
    setLoading(true);
    // In a real app, you would save these settings to the backend
    console.log('Security settings:', values);
    setTimeout(() => {
      message.success('Security settings saved successfully');
      setLoading(false);
    }, 500);
  };

  const handleNotificationsSubmit = (values: any) => {
    setLoading(true);
    // In a real app, you would save these settings to the backend
    console.log('Notification settings:', values);
    setTimeout(() => {
      message.success('Notification settings saved successfully');
      setLoading(false);
    }, 500);
  };

  const runBackupNow = () => {
    setLoading(true);
    // In a real app, you would trigger a backup operation
    setTimeout(() => {
      message.success('Manual backup completed successfully');
      setLoading(false);
    }, 1500);
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'general',
      label: (
        <span className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          General
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGeneralSubmit}
          initialValues={{
            institutionName: 'Shiv Nadar University',
            academicYear: '2023-2024',
            timezone: 'America/New_York',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            language: 'en-US',
            maintenanceMode: false
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item
                name="institutionName"
                label="Institution Name"
                rules={[{ required: true, message: 'Please enter the institution name' }]}
              >
                <Input prefix={<Globe className="h-4 w-4 text-gray-400" />} />
              </Form.Item>
              
              <Form.Item
                name="academicYear"
                label="Current Academic Year"
                rules={[{ required: true, message: 'Please select the academic year' }]}
              >
                <Select>
                  <Select.Option value="2022-2023">2022-2023</Select.Option>
                  <Select.Option value="2023-2024">2023-2024</Select.Option>
                  <Select.Option value="2024-2025">2024-2025</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="timezone"
                label="System Timezone"
                rules={[{ required: true, message: 'Please select the timezone' }]}
              >
                <Select>
                  <Select.Option value="America/New_York">Eastern Time (ET)</Select.Option>
                  <Select.Option value="America/Chicago">Central Time (CT)</Select.Option>
                  <Select.Option value="America/Denver">Mountain Time (MT)</Select.Option>
                  <Select.Option value="America/Los_Angeles">Pacific Time (PT)</Select.Option>
                  <Select.Option value="UTC">UTC</Select.Option>
                </Select>
              </Form.Item>
            </div>
            
            <div>
              <Form.Item
                name="dateFormat"
                label="Date Format"
              >
                <Select>
                  <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
                  <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                  <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="timeFormat"
                label="Time Format"
              >
                <Radio.Group>
                  <Radio value="12h">12-hour (AM/PM)</Radio>
                  <Radio value="24h">24-hour</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="language"
                label="Default Language"
              >
                <Select>
                  <Select.Option value="en-US">English (US)</Select.Option>
                  <Select.Option value="es">Spanish</Select.Option>
                  <Select.Option value="fr">French</Select.Option>
                  <Select.Option value="de">German</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="maintenanceMode"
                label="Maintenance Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Save className="h-4 w-4 mr-1" />}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'backup',
      label: (
        <span className="flex items-center">
          <Database className="mr-2 h-4 w-4" />
          Backup & Storage
        </span>
      ),
      children: (
        <div>
          <Form
            form={backupForm}
            layout="vertical"
            onFinish={handleBackupSubmit}
            initialValues={{
              automatedBackups: true,
              backupFrequency: 'daily',
              backupTime: null,
              retentionDays: 30,
              storageLocation: 'cloud',
              compressionLevel: 'medium'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Form.Item
                  name="automatedBackups"
                  label="Automated Backups"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="backupFrequency"
                  label="Backup Frequency"
                  dependencies={['automatedBackups']}
                >
                  <Select disabled={!backupForm.getFieldValue('automatedBackups')}>
                    <Select.Option value="hourly">Hourly</Select.Option>
                    <Select.Option value="daily">Daily</Select.Option>
                    <Select.Option value="weekly">Weekly</Select.Option>
                    <Select.Option value="monthly">Monthly</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="backupTime"
                  label="Backup Time"
                  dependencies={['automatedBackups']}
                >
                  <TimePicker 
                    format="HH:mm" 
                    disabled={!backupForm.getFieldValue('automatedBackups')}
                    placeholder="Select time"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
              
              <div>
                <Form.Item
                  name="retentionDays"
                  label="Retention Period (days)"
                >
                  <InputNumber min={1} max={365} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  name="storageLocation"
                  label="Storage Location"
                >
                  <Select>
                    <Select.Option value="local">Local Storage</Select.Option>
                    <Select.Option value="cloud">Cloud Storage</Select.Option>
                    <Select.Option value="both">Both (Redundancy)</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="compressionLevel"
                  label="Compression Level"
                >
                  <Select>
                    <Select.Option value="none">None</Select.Option>
                    <Select.Option value="low">Low</Select.Option>
                    <Select.Option value="medium">Medium</Select.Option>
                    <Select.Option value="high">High</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            
            <Card title="Backup Status" className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>Last Backup:</strong> 16 March 2024, 02:30 AM</p>
                  <p><strong>Status:</strong> <span className="text-green-500 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Successful</span></p>
                  <p><strong>Backup Size:</strong> 1.2 GB</p>
                </div>
                <Button 
                  onClick={runBackupNow} 
                  icon={<Cloud className="h-4 w-4 mr-1" />}
                  loading={loading}
                >
                  Run Backup Now
                </Button>
              </div>
            </Card>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<Save className="h-4 w-4 mr-1" />}>
                Save Backup Settings
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    },
    {
      key: 'security',
      label: (
        <span className="flex items-center">
          <Shield className="mr-2 h-4 w-4" />
          Security
        </span>
      ),
      children: (
        <Form
          form={securityForm}
          layout="vertical"
          onFinish={handleSecuritySubmit}
          initialValues={{
            passwordExpiration: 90,
            passwordComplexity: 'high',
            failedLoginAttempts: 5,
            lockoutDuration: 30,
            twoFactorAuth: false,
            sessionTimeout: 30,
            ipRestriction: false
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item
                name="passwordExpiration"
                label="Password Expiration (days)"
              >
                <InputNumber min={0} max={365} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="passwordComplexity"
                label="Password Complexity"
              >
                <Select>
                  <Select.Option value="low">Low (Minimum 6 characters)</Select.Option>
                  <Select.Option value="medium">Medium (8+ chars, mixed case)</Select.Option>
                  <Select.Option value="high">High (8+ chars, mixed case, numbers, symbols)</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="failedLoginAttempts"
                label="Failed Login Attempts Before Lockout"
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="lockoutDuration"
                label="Account Lockout Duration (minutes)"
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            
            <div>
              <Form.Item
                name="twoFactorAuth"
                label="Two-Factor Authentication"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="sessionTimeout"
                label="Session Timeout (minutes)"
              >
                <InputNumber min={5} max={240} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="ipRestriction"
                label="IP Restriction"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="allowedIPs"
                label="Allowed IP Addresses"
                dependencies={['ipRestriction']}
              >
                <Input.TextArea 
                  rows={3} 
                  disabled={!securityForm.getFieldValue('ipRestriction')}
                  placeholder="Enter IP addresses separated by commas (e.g., 192.168.1.1, 10.0.0.1)"
                />
              </Form.Item>
            </div>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Lock className="h-4 w-4 mr-1" />}>
              Save Security Settings
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'notifications',
      label: (
        <span className="flex items-center">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </span>
      ),
      children: (
        <Form
          form={notificationsForm}
          layout="vertical"
          onFinish={handleNotificationsSubmit}
          initialValues={{
            emailNotifications: true,
            systemNotifications: true,
            loginAlerts: true,
            maintenanceAlerts: true,
            backupAlerts: false,
            userActivityAlerts: false,
            systemErrorAlerts: true
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="adminEmailAddress"
                label="Admin Email Address"
                dependencies={['emailNotifications']}
              >
                <Input 
                  prefix={<Mail className="h-4 w-4 text-gray-400" />}
                  disabled={!notificationsForm.getFieldValue('emailNotifications')}
                  placeholder="admin@university.edu"
                />
              </Form.Item>
              
              <Form.Item
                name="systemNotifications"
                label="System Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
            
            <div>
              <Card title="Alert Types" className="mb-4">
                <Form.Item
                  name="loginAlerts"
                  label="Failed Login Attempts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="maintenanceAlerts"
                  label="Maintenance Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="backupAlerts"
                  label="Backup Status Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="userActivityAlerts"
                  label="User Activity Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="systemErrorAlerts"
                  label="System Error Alerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Card>
            </div>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Bell className="h-4 w-4 mr-1" />}>
              Save Notification Settings
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <Tabs 
          defaultActiveKey="general" 
          className="p-4"
          items={tabItems}
          type="card"
        />
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <AlertCircle className="inline h-4 w-4 mr-1" />
        Note: Some settings may require a system restart to take effect.
      </div>
    </div>
  );
};

export default SystemSettings; 