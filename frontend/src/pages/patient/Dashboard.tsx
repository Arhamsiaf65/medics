import { Typography, Card, Statistic, Row, Col } from 'antd';
import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const { Title } = Typography;

export const PatientDashboard = () => {
  const [stats, setStats] = useState({ total: 0, upcoming: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/appointments/my');
        const appointments = response.data;
        setStats({
          total: appointments.length,
          upcoming: appointments.filter((app: any) => app.status === 'Scheduled').length
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={3}>Patient Dashboard</Title>
      <Row gutter={16} className="mt-6">
        <Col span={12}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Appointments"
              value={stats.total}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Upcoming Appointments"
              value={stats.upcoming}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
