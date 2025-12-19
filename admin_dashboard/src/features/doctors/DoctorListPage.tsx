import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Avatar, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, ScheduleOutlined } from '@ant-design/icons';
import { useDoctorStore } from './doctorStore';
import type { Doctor } from '../../types';
import { Upload, Switch } from 'antd';
import ScheduleModal from './ScheduleModal';


const DoctorListPage: React.FC = () => {
    const { doctors, loading, fetchDoctors, addDoctor, updateDoctor, deleteDoctor } = useDoctorStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isTopDoctor, setIsTopDoctor] = useState(false);

    // Schedule Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleDoctor, setScheduleDoctor] = useState<Doctor | null>(null);


    const uploadToCloudinary = async (file: File) => {
        const url = "https://api.cloudinary.com/v1_1/dtq2ycobw/image/upload";
        const preset = "medics";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", preset);

        const res = await fetch(url, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload failed");

        return data.secure_url;
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Only images are allowed");
            // return Upload.LIST_IGNORE;
        }
        return true;
    };

    const handleImageUpload = async ({ file }: any) => {
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setImageUrl(url);
            form.setFieldsValue({ imageUrl: url });
            message.success("Image uploaded!");
        } catch {
            message.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };




    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const handleAdd = () => {
        setEditingDoctor(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: Doctor) => {
        setEditingDoctor(record);
        form.setFieldsValue({
            ...record,
            consultationFee: record.consultationFee?.toString()
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoctor(id);
            message.success('Doctor deleted successfully');
        } catch (error) {
            message.error('Failed to delete doctor');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (editingDoctor) {
                await updateDoctor(editingDoctor.id, values);
                message.success('Doctor updated successfully');
            } else {
                await addDoctor(values);
                message.success('Doctor added successfully');
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url: string) => <Avatar src={url} icon={<UserOutlined />} size="large" />,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: 'Specialty',
            dataIndex: 'specialty',
            key: 'specialty',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Fee',
            dataIndex: 'consultationFee',
            key: 'consultationFee',
            render: (fee: any) => `$${fee}`,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Doctor) => (
                <Space>
                    <Button
                        icon={<ScheduleOutlined />}
                        onClick={() => { setScheduleDoctor(record); setIsScheduleModalOpen(true); }}
                    >
                        Schedule
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm title="Delete doctor?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                        <Button icon={<DeleteOutlined />} danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Doctors</h1>
                    <p className="text-gray-500">Manage doctor profiles</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
                    Add New Doctor
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={doctors}
                rowKey="id"
                loading={loading}
                className="shadow-sm bg-white rounded-lg"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitting}
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="Doctor Name" rules={[{ required: true, message: 'Please enter doctor name' }]}>
                        <Input placeholder="e.g. Dr. Sarah Smith" />
                    </Form.Item>

                    {!editingDoctor && (
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder="doctor@medics.com" />
                            </Form.Item>
                            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                                <Input.Password placeholder="******" />
                            </Form.Item>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="specialty" label="Specialty" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Cardiology" />
                        </Form.Item>
                        <Form.Item name="consultationFee" label="Consultation Fee ($)" rules={[{ required: true }]}>
                            <Input type="number" min={0} />
                        </Form.Item>
                    </div>




                    <Form.Item name="imageUrl" label="Profile Image" rules={[{ required: false }]}>
                        <Upload
                            showUploadList={false}
                            listType="picture-card"
                            beforeUpload={beforeUpload}
                            customRequest={handleImageUpload}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="avatar"
                                    className='mt-5'
                                    style={{ width: '100%', borderRadius: 8 }}
                                    draggable={false}
                                />
                            ) : (
                                <div>
                                    {uploading ? "Uploading..." : "+"}
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item name="isTopDoctor" label="Top Doctor" valuePropName="checked">
                        <Switch checked={isTopDoctor} onChange={() => setIsTopDoctor(!isTopDoctor)} />
                    </Form.Item>

                    <Form.Item name="about" label="About / Bio">
                        <Input.TextArea rows={4} placeholder="Brief description about the doctor..." />
                    </Form.Item>
                </Form>
            </Modal>

            {scheduleDoctor && (
                <ScheduleModal
                    doctor={scheduleDoctor}
                    open={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                />
            )}
        </div>
    );
};

export default DoctorListPage;
