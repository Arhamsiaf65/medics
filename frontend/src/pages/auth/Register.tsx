import { useState } from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

export const Register = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', values);
      const { user, token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
      }

      setAuth(user);
      
      message.success('Registration successful');
      navigate('/patient'); // Always a patient on self-registration
    } catch (error: any) {
       message.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
      <div className="mb-8 text-center">
        <Title level={2} className="text-blue-600">MEDICS</Title>
        <Text type="secondary">Create a new Patient Account</Text>
      </div>
      <Card className="w-full max-w-md shadow-lg border-0 rounded-lg">
        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your Name!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Full Name" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-600" loading={loading}>
              Sign Up
            </Button>
          </Form.Item>
          <div className="text-center text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
