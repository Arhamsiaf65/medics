import { useState, useEffect } from 'react';
import { Typography, Table, Button, Form, Input, Modal, Popconfirm, Tag, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Title } = Typography;

export const ManageAdmins = () => {
  const { message } = App.useApp();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // This page should only be accessible/functional for root admins but we'll show it anyway and let backend reject.
  // Alternatively we can try to guess who is Root Admin

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response.data);
    } catch (error: any) {
       message.error(error.response?.data?.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (values: any) => {
    try {
      await api.post('/admin/admins', values);
      message.success('Admin added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchAdmins();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to add admin');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/admins/${id}`);
      message.success('Admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: ['user', 'name'],
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Role Type',
      key: 'isRoot',
      render: (_: any, record: any) => (
         <Tag color={record.user?.email === 'arjamsiaf65@gmail.com' ? 'gold' : 'blue'}>
           {record.user?.email === 'arjamsiaf65@gmail.com' ? 'Root Admin' : 'Admin'}
         </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        record.user?.email !== 'arjamsiaf65@gmail.com' && (
          <Popconfirm
            title="Are you sure to delete this Admin?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">Manage Admins</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Admin
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={admins} 
        rowKey="_id" 
        loading={loading}
        className="shadow-sm border border-gray-100 rounded-lg"
      />

      <Modal
        title="Add New Admin"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAdmin}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Temporary Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button onClick={() => setIsModalVisible(false)} className="mr-2">Cancel</Button>
            <Button type="primary" htmlType="submit">Add Admin</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
