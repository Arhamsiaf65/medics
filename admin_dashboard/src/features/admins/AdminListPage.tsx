import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Button } from 'antd';
import { Modal } from 'antd';
import { Form } from 'antd';
import { Input } from 'antd';

import { message } from 'antd';
import { Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import type { User } from '../../types';

const AdminListPage: React.FC = () => {
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/admin/admins');
            setAdmins(response.data.data);
        } catch (error) {
            message.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAdd = async (values: any) => {
        setSubmitting(true);
        try {
            await axiosClient.post('/admin/create-admin', values);
            message.success('Admin created successfully');
            setIsModalOpen(false);
            form.resetFields();
            fetchAdmins();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to create admin');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axiosClient.delete(`/admin/${id}`);
            message.success('Admin deleted successfully');
            setAdmins(admins.filter(admin => admin.id !== id));
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to delete admin');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center w-fit gap-1 ${role === 'ROOT' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    <SafetyCertificateOutlined /> {role}
                </span>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
                record.role !== 'ROOT' && (
                    <Popconfirm
                        title="Delete admin?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
                    </Popconfirm>
                )
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Admin Management</h1>
                    <p className="text-gray-500">Manage system administrators</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size="large">
                    Create New Admin
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={admins}
                rowKey="id"
                loading={loading}
                className="shadow-sm bg-white rounded-lg"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Create New Admin"
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd} className="mt-4">
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input placeholder="John Doe" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="admin@medics.com" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password placeholder="******" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminListPage;
