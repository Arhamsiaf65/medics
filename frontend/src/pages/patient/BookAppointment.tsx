import { useState, useEffect } from 'react';
import { Typography, Table, Button, DatePicker, Select, App } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

export const BookAppointment = () => {
  const { message } = App.useApp();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const fetchSlots = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await api.get(`/appointments/available-slots?date=${formattedDate}`);
      
      const rawData = response.data;
      let flattenedSlots: any[] = [];
      const uniqueDocs: any[] = [];
      
      rawData.forEach((docData: any) => {
        uniqueDocs.push({ _id: docData.doctorId, name: docData.doctorName });
        
        docData.availableSlots.forEach((slotString: string) => {
          flattenedSlots.push({
            _id: `${docData.doctorId}-${slotString}`,
            doctorId: docData.doctorId,
            doctorName: docData.doctorName || 'Unknown Doctor',
            specialization: docData.specialization,
            timeSlot: slotString,
            date: formattedDate
          });
        });
      });
      
      setSlots(flattenedSlots as any);
      setDoctors(uniqueDocs as any);
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      message.error("Failed to fetch available slots");
      setSlots([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (doctorId: string, selectedDate: string, timeSlot: string) => {
    try {
      await api.post('/appointments/book', { doctorId, date: selectedDate, timeSlot });
      message.success("Appointment booked successfully!");
      fetchSlots(); 
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to book appointment");
    }
  };

  const displayedSlots = selectedDoctor 
    ? slots.filter((s: any) => s.doctorId === selectedDoctor)
    : slots;

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctor',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Time',
      dataIndex: 'timeSlot',
      key: 'time',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => handleBook(record.doctorId, record.date, record.timeSlot)}>
          Book Slot
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Book an Appointment</Title>
      
      <div className="flex gap-4 mb-6 mt-4">
        <DatePicker 
          value={date} 
          onChange={(d) => setDate(d)} 
          allowClear={false}
          className="w-48"
        />
        <Select 
          placeholder="Filter by Doctor" 
          allowClear 
          className="w-64"
          onChange={(val) => setSelectedDoctor(val)}
          value={selectedDoctor}
        >
          {doctors.map((doc: any) => (
            <Option key={doc._id} value={doc._id}>{doc.name}</Option>
          ))}
        </Select>
      </div>

      <Table 
        columns={columns} 
        dataSource={displayedSlots} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="shadow-sm border border-gray-100 rounded-lg"
      />
    </div>
  );
};
