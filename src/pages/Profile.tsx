import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Shield, 
  Settings,
  Camera,
  Edit2,
  Save,
  X,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

const Profile = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || '',
    studentId: user?.studentId || '',
    enrollmentYear: user?.enrollmentYear || '',
    major: user?.major || '',
    gpa: user?.gpa || '',
    creditsCompleted: user?.creditsCompleted || '',
    profilePicture: user?.profilePicture || '',
  });

  const sections: ProfileSection[] = [
    { id: 'personal', title: 'Personal Information', icon: User },
    ...(user?.role === 'student' ? [{ id: 'academic', title: 'Academic Details', icon: GraduationCap }] : []),
    ...(user?.role === 'faculty' ? [{ id: 'courses', title: 'Course Details', icon: BookOpen }] : []),
    ...(user?.role === 'head' ? [{ id: 'department', title: 'Department Details', icon: Users }] : []),
    ...(user?.role === 'admin' ? [{ id: 'admin', title: 'Administrative Details', icon: Shield }] : []),
    { id: 'security', title: 'Security Settings', icon: Shield },
    { id: 'preferences', title: 'Preferences', icon: Settings },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
      enrollmentYear: user?.enrollmentYear || '',
      major: user?.major || '',
      gpa: user?.gpa || '',
      creditsCompleted: user?.creditsCompleted || '',
      profilePicture: user?.profilePicture || '',
    });
    setIsEditing(false);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profileData.profilePicture ? (
              <img 
                src={profileData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-primary" />
            )}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">{profileData.name}</h2>
          <p className="text-muted-foreground">{profileData.email}</p>
          <p className="text-muted-foreground">{profileData.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                />
              ) : (
                <p className="font-medium">{profileData.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                />
              ) : (
                <p className="font-medium">{profileData.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Address</label>
              {isEditing ? (
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                  rows={3}
                />
              ) : (
                <p className="font-medium">{profileData.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Only show student-specific fields for students */}
          {user?.role === 'student' && (
            <>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">Enrollment Year</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.enrollmentYear}
                      onChange={(e) => setProfileData({ ...profileData, enrollmentYear: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                    />
                  ) : (
                    <p className="font-medium">{profileData.enrollmentYear}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.major}
                      onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                    />
                  ) : (
                    <p className="font-medium">{profileData.major}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">GPA</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.gpa}
                      onChange={(e) => setProfileData({ ...profileData, gpa: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                    />
                  ) : (
                    <p className="font-medium">{profileData.gpa}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Show department information for faculty and department heads */}
          {(user?.role === 'faculty' || user?.role === 'head') && (
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                  />
                ) : (
                  <p className="font-medium">{profileData.department || 'Not assigned'}</p>
                )}
              </div>
            </div>
          )}

          {/* Show role for admins */}
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Role</label>
                <p className="font-medium">System Administrator</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-4">Academic Progress</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Credits Completed</p>
              <p className="text-2xl font-semibold">{profileData.creditsCompleted}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current GPA</p>
              <p className="text-2xl font-semibold">{profileData.gpa}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-4">Enrollment Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="text-2xl font-semibold">{profileData.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrollment Year</p>
              <p className="text-2xl font-semibold">{profileData.enrollmentYear}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-4">Password & Security</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Current Password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">New Password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirm New Password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {user?.role === 'student' 
            ? 'Student Profile' 
            : user?.role === 'faculty' 
            ? 'Faculty Profile' 
            : user?.role === 'admin' 
            ? 'Administrator Profile' 
            : user?.role === 'head' 
            ? 'Department Head Profile' 
            : 'User Profile'}
        </h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
              )}
            >
              <section.icon className="w-5 h-5" />
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeSection === 'personal' && renderPersonalInfo()}
          {activeSection === 'academic' && user?.role === 'student' && renderAcademicInfo()}
          {activeSection === 'courses' && user?.role === 'faculty' && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Teaching Courses</h3>
                <p className="text-muted-foreground mb-4">Courses you are currently teaching:</p>
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">CS101: Introduction to Programming</p>
                    <p className="text-sm text-muted-foreground">35 enrolled students</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">CS305: Data Structures and Algorithms</p>
                    <p className="text-sm text-muted-foreground">42 enrolled students</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">CS401: Advanced Database Systems</p>
                    <p className="text-sm text-muted-foreground">28 enrolled students</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'department' && user?.role === 'head' && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Department Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Department Name</p>
                    <p className="text-xl font-semibold">{profileData.department || 'Computer Science'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Faculty Members</p>
                    <p className="text-xl font-semibold">35</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-xl font-semibold">48</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'admin' && user?.role === 'admin' && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Administrator Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Admin ID</p>
                    <p className="text-xl font-semibold">ADMIN-{user?.id || '001'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Access Level</p>
                    <p className="text-xl font-semibold">Full System Access</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'security' && renderSecuritySettings()}
          {activeSection === 'preferences' && renderPreferences()}
        </div>
      </div>
    </div>
  );
};

export default Profile; 