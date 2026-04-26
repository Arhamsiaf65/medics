import { useState, useEffect } from 'react';
import { Typography, Table, Select, App } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axios';

const { Title } = Typography;
const { Option } = Select;

export const AllAppointments = () => {
  const { message } = App.useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/admin/appointments');
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
      await api.patch(`/appointments/admin/${id}/status`, { status });
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
      render: (status: string, record: any) => {
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
            <Option value="cancelled">Cancelled</Option>
          </Select>
        )
      }
    }
  ];

  return (
    <div>
      <Title level={3}>All System Appointments</Title>
      <Table 
        columns={columns} 
        dataSource={appointments} 
        rowKey="_id" 
        loading={loading}
        className="mt-6 shadow-sm border border-gray-100 rounded-lg"
      />
    </div>
  );
};
