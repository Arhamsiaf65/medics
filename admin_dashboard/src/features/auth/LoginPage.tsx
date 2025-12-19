import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);

    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.post('/auth/login', values);
            const { user, token } = response.data.data;
            login(user, token);
            message.success('Login successful');
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LockOutlined className="text-white text-2xl" />
                    </div>
                    <Title level={2}>Pharmacy Admin</Title>
                    <Typography.Text type="secondary">Sign in to manage medics</Typography.Text>
                </div>

                {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Invalid email' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
