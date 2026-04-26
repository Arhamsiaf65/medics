import { useState } from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export const Login = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const { user } = response.data;

      // Store auth state — login already returned a verified user, no need to re-call /auth/me
      setAuth(user);

      message.success('Login successful');

      // Navigate based on role
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Invalid email or password');
      } else {
        console.error('Login error:', error);
        message.error('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
      <div className="mb-8 text-center">
        <Title level={2} className="text-blue-600">MEDICS</Title>
        <Text type="secondary">Sign in to your account</Text>
      </div>
      <Card className="w-full max-w-md shadow-lg border-0 rounded-lg">
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-600" loading={loading}>
              Log in
            </Button>
          </Form.Item>
          <div className="text-center text-gray-500">
            Don't have an account? <Link to="/register" className="text-blue-600">Register now!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
