import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  UserOutlined, 
  CalendarOutlined, 
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [];

  if (user?.role === 'Admin') {
    menuItems.push(
      { key: '/admin', icon: <DashboardOutlined />, label: 'Overview' },
      { key: '/admin/doctors', icon: <TeamOutlined />, label: 'Manage Doctors' },
      { key: '/admin/admins', icon: <SettingOutlined />, label: 'Manage Admins' },
      { key: '/admin/appointments', icon: <CalendarOutlined />, label: 'All Appointments' }
    );
  } else if (user?.role === 'Doctor') {
    menuItems.push(
      { key: '/doctor', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/doctor/schedule', icon: <CalendarOutlined />, label: 'My Schedule' },
      { key: '/doctor/appointments', icon: <UserOutlined />, label: 'Appointments' },
      { key: '/doctor/profile', icon: <SettingOutlined />, label: 'Profile Settings' }
    );
  } else if (user?.role === 'Patient') {
    menuItems.push(
      { key: '/patient', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/patient/book', icon: <CalendarOutlined />, label: 'Book Appointment' },
      { key: '/patient/appointments', icon: <UserOutlined />, label: 'My Appointments' }
    );
  }

  return (
    <Layout className="min-h-screen">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="h-16 flex items-center justify-center bg-blue-600">
          <span className="text-white font-bold text-xl tracking-wider">MEDICS</span>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex justify-between items-center shadow-sm">
          <div className="font-semibold text-gray-700">
            Welcome, {user?.name} ({user?.role})
          </div>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
