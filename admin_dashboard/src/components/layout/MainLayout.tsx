import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    DashboardOutlined,
    MedicineBoxOutlined,
    LogoutOutlined,
    SafetyCertificateOutlined,
    ScheduleOutlined,
    MessageOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
    ];

    if (user?.role === 'DOCTOR') {
        menuItems.push({
            key: '/schedule',
            icon: <ScheduleOutlined />,
            label: 'Schedule',
        });
    }

     if (user?.role === 'DOCTOR') {
        menuItems.push({
            key: '/chats',
            icon: <MessageOutlined />,
            label: 'Chats',
        });
    }

      if (user?.role === 'DOCTOR') {
        menuItems.push({
            key: '/articles',
            icon: <FileTextOutlined />,
            label: 'Articles',
        });
    }

    if (user?.role !== 'DOCTOR') {
        menuItems.push({
            key: '/doctors',
            icon: <MedicineBoxOutlined />,
            label: 'Doctors',
        });
    }

    if (user?.role === 'ROOT') {
        menuItems.push({
            key: '/admins',
            icon: <SafetyCertificateOutlined />,
            label: 'Admins',
        });
    }

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: handleLogout
            }
        ]
    };

    return (
        <Layout className="min-h-screen">
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="shadow-md z-1">
                <div className="h-16 m-4 flex items-center justify-center overflow-hidden">
                    {collapsed ? <MedicineBoxOutlined className="text-2xl text-blue-600" /> : <span className="text-xl font-bold text-blue-600 whitespace-nowrap">Pharmacy</span>}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div className="mr-4">
                        <Dropdown menu={userMenu}>
                            <div className="flex items-center cursor-pointer gap-2">
                                <span className="font-medium hidden sm:inline">{user?.name || 'Admin'}</span>
                                <Avatar icon={<UserOutlined />} src={user?.avatarUrl} size="large" className="bg-blue-500" />
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 8,
                        overflowY: 'auto'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
