import { useState, useEffect } from 'react';
import { Typography, Table, Button, Form, Input, Modal, Popconfirm, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Title } = Typography;

export const ManageDoctors = () => {
  const { message } = App.useApp();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      message.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (values: any) => {
    try {
      await api.post('/admin/add-doctor', values);
      message.success('Doctor added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchDoctors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/doctors/${id}`);
      message.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      message.error('Failed to delete doctor');
    }
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => <Typography.Text type="secondary" copyable>{text}</Typography.Text>
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee: number) => `$${fee || 0}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Are you sure to delete this doctor?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">Manage Doctors</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Doctor
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={doctors} 
        rowKey="_id" 
        loading={loading}
        className="shadow-sm border border-gray-100 rounded-lg"
      />

      <Modal
        title="Add New Doctor"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddDoctor}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Temporary Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fee" label="Consultation Fee ($)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button onClick={() => setIsModalVisible(false)} className="mr-2">Cancel</Button>
            <Button type="primary" htmlType="submit">Add Doctor</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
