import { Typography, Card, Statistic, Row, Col } from 'antd';
import { TeamOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

const { Title } = Typography;

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ doctors: 0, appointments: 0, admins: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, appsRes] = await Promise.all([
          api.get('/admin/doctors'),
          api.get('/appointments/admin/appointments')
        ]);
        
        setStats({
          doctors: docsRes.data.length,
          appointments: appsRes.data.length,
          // Handling admin count might need root admin access, if it fails we just default to 0
          admins: 0 
        });

        // Try fetching admins if root
        try {
          const adminsRes = await api.get('/admin/admins');
          setStats(prev => ({...prev, admins: adminsRes.data.length}));
        } catch(e) {}

      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={3}>Admin Overview</Title>
      <Row gutter={16} className="mt-6">
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Doctors"
              value={stats.doctors}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Appointments"
              value={stats.appointments}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Admins"
              value={stats.admins}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
