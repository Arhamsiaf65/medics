import { useState, useEffect } from 'react';
import { Typography, Table, Tag, Select, App, Button, Space, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api/axios';
import { useChatStore } from '../../store/chatStore';
import { ChatDrawer } from '../../components/ChatDrawer';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;
const { Option } = Select;

export const DoctorAppointments = () => {
  const { message } = App.useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openDrawer } = useChatStore();
  const { user } = useAuthStore();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/doctor/appointments');
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/doctor/${id}/status`, { status });
      message.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
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
      render: (status: string, record: any) => {
        if (status === 'cancelled') return <Tag color="red">Cancelled</Tag>;
        if (status === 'rejected') return <Tag color="red">Rejected</Tag>;
        if (status === 'completed') return <Tag color="green">Completed</Tag>;
        
        return (
          <Select 
            value={status} 
            onChange={(val) => updateStatus(record._id, val)}
            className="w-32"
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="completed">Completed</Option>
          </Select>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Badge count={useChatStore(state => state.unreadCounts[record.patient?._id || record.patient]) || 0}>
            <Button 
              type="primary" 
              size="small" 
              icon={<MessageOutlined />} 
              onClick={() => {
                const patientId = record.patient?._id || record.patient;
                const doctorId = user?._id;
                if (doctorId && patientId) {
                  openDrawer(doctorId, patientId);
                }
              }}
            >
              Chat
            </Button>
          </Badge>
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
