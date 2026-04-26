import { useState, useEffect } from 'react';
import { Typography, Table, Button, Tag, App, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api/axios';
import { useChatStore } from '../../store/chatStore';
import { ChatDrawer } from '../../components/ChatDrawer';

const { Title } = Typography;

export const PatientAppointments = () => {
  const { message } = App.useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openDrawer } = useChatStore();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data);
    } catch (error) {
      message.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: string) => {
    try {
      await api.patch(`/appointments/cancel/${id}`);
      message.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      message.error("Failed to cancel appointment");
    }
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: ['doctor', 'user', 'name'],
      key: 'doctor',
    },
    {
      title: 'Date & Time',
      key: 'date',
      render: (_: any, record: any) => `${dayjs(record.date).format('MMMM D, YYYY')} at ${record.timeSlot}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'orange',
          approved: 'blue',
          rejected: 'red',
          cancelled: 'red',
          completed: 'green'
        };
        const color = colorMap[status] || 'default';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {(record.status === 'pending' || record.status === 'approved') && (
            <Button danger size="small" onClick={() => cancelAppointment(record._id)}>Cancel</Button> 
          )}
          <Button 
            type="primary" 
            size="small" 
            icon={<MessageOutlined />} 
            onClick={() => openDrawer(record.doctor.user._id, record.patient)}
          >
            Chat
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>My Appointments</Title>
      <Table 
        columns={columns} 
        dataSource={appointments} 
        rowKey="_id" 
        loading={loading}
        className="mt-6 shadow-sm border border-gray-100 rounded-lg"
      />
      <ChatDrawer />
    </div>
  );
};
