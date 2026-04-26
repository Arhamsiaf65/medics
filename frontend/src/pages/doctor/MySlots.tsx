import { useState, useEffect } from 'react';
import { Typography, Table, Tag, App, DatePicker } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axios';

const { Title, Paragraph } = Typography;

export const DoctorSlots = () => {
  const { message } = App.useApp();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());

  useEffect(() => {
    const fetchSlots = async () => {
      if (!date) return;
      setLoading(true);
      try {
        const dateStr = date.format('YYYY-MM-DD');
        const response = await api.get(`/appointments/doctor/my-slots?date=${dateStr}`);
        
        const { allSlots, bookedSlots } = response.data;
        const formattedSlots = allSlots.map((slot: string) => ({
          timeSlot: slot,
          isBooked: bookedSlots.includes(slot)
        }));
        
        setSlots(formattedSlots);
      } catch (error) {
        message.error("Failed to fetch slots");
        setSlots([]); // clear slots on error (e.g. no doctor profile)
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [date]);

  const columns = [
    {
      title: 'Time Slot',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: 'Status',
      dataIndex: 'isBooked',
      key: 'isBooked',
      render: (isBooked: boolean) => (
        <Tag color={isBooked ? 'red' : 'green'}>{isBooked ? 'Booked' : 'Available'}</Tag>
      )
    }
  ];

  return (
    <div>
      <Title level={3}>My Schedule</Title>
      <Paragraph type="secondary">View your generated availability slots.</Paragraph>
      
      <div className="mb-4">
        <DatePicker 
          value={date} 
          onChange={(d) => setDate(d)} 
          allowClear={false}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={slots} 
        rowKey="timeSlot" 
        loading={loading}
        className="mt-4 shadow-sm border border-gray-100 rounded-lg"
      />
    </div>
  );
};
