import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Empty, Descriptions, Avatar, Tag } from 'antd';
import { ScheduleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import ScheduleModal from '../features/doctors/ScheduleModal';
import axiosClient from '../api/axiosClient';
import type { Doctor } from '../types';

const MySchedulePage: React.FC = () => {
    const { user } = useAuthStore();
    const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMyProfile = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch all doctors and find match by userId
                const res = await axiosClient.get('/doctors');
                if (res.data.success) {
                    // We need to type cast or ensure userId is in type (it's not yet)
                    const myDoc = res.data.data.find((d: any) => d.userId === user.id);
                    setDoctorProfile(myDoc || null);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, [user]);

    if (loading) return <div className="flex justify-center p-12"><Spin size="large" /></div>;

    if (!doctorProfile) {
        return (
            <div className="p-8">
                <Empty description="No Doctor Profile Found linked to this account." />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Schedule</h1>

            <Card className="max-w-3xl">
                <div className="flex items-start gap-6 mb-8">
                    <Avatar size={100} src={doctorProfile.imageUrl} icon={<UserOutlined />} />
                    <div>
                        <h2 className="text-xl font-bold">{doctorProfile.name}</h2>
                        <Tag color="blue" className="mt-2">{doctorProfile.specialty}</Tag>
                        <p className="text-gray-500 mt-2">{doctorProfile.hospital}</p>
                    </div>
                    <div className="ml-auto">
                        <Button
                            type="primary"
                            size="large"
                            icon={<ScheduleOutlined />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Manage Schedule
                        </Button>
                    </div>
                </div>

                <Descriptions title="Details" bordered column={1}>
                    <Descriptions.Item label="Consultation Fee">${doctorProfile.consultationFee}</Descriptions.Item>
                    <Descriptions.Item label="Reviews">⭐ {doctorProfile.experience || '4.5'} (120 reviews)</Descriptions.Item>
                    <Descriptions.Item label="About">{doctorProfile.about || 'No description available.'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Booked Appointments</h2>
                    <Button onClick={() => window.location.reload()}>Refresh</Button>
                </div>
                <BookedAppointmentsList doctorId={doctorProfile.id} />
            </div>

            <ScheduleModal
                doctor={doctorProfile}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

const BookedAppointmentsList: React.FC<{ doctorId: string }> = ({ doctorId }) => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/appointments/doctor/${doctorId}`);
                if (res.data.success) {
                    setAppointments(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch appointments");
            } finally {
                setLoading(false);
            }
        };
        if (doctorId) fetchAppointments();
    }, [doctorId]);

    if (loading) return <Spin />;

    if (appointments.length === 0) return <Empty description="No booked appointments." />;

    return (
        <div className="grid gap-4">
            {appointments.map((apt: any) => (
                <Card key={apt.id} size="small" className="border-l-4 border-l-blue-500 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{apt.date} at {apt.time}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar size="small" icon={<UserOutlined />} src={apt.user?.avatarUrl} />
                                <span className="font-medium">{apt.user?.name}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">{apt.reason || 'No reason provided'}</span>
                            </div>
                        </div>
                        <div>
                            <Tag color={apt.status === 'CONFIRMED' ? 'green' : 'orange'}>{apt.status}</Tag>
                            <Tag color={apt.paymentStatus === 'PAID' ? 'green' : 'default'}>{apt.paymentStatus}</Tag>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default MySchedulePage;
