import { Typography, Card, Statistic, Row, Col } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const { Title } = Typography;

export const DoctorDashboard = () => {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get('/appointments/doctor/appointments');
        const appointments = response.data;
        setStats({
          total: appointments.length,
          upcoming: appointments.filter((app: any) => app.status === 'Scheduled').length,
          completed: appointments.filter((app: any) => app.status === 'Completed').length,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
        setStats({ total: 0, upcoming: 0, completed: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={3}>Doctor Dashboard</Title>
      <Row gutter={16} className="mt-6">
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Assigned"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Upcoming Appointments"
              value={stats.upcoming}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CalendarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Completed Appointments"
              value={stats.completed}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
