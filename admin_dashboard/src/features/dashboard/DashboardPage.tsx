import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';

const DashboardPage: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <Row gutter={16}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm mb-4">
                        <Statistic
                            title="Total Doctors"
                            value={12} // Placeholder
                            prefix={<MedicineBoxOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm mb-4">
                        <Statistic
                            title="Active Sessions"
                            value={5} // Placeholder
                            prefix={<UserOutlined className="text-green-500" />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="shadow-sm mb-4">
                        <Statistic
                            title="Total Appointments"
                            value={156} // Placeholder
                            prefix={<CalendarOutlined className="text-purple-500" />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row className="mt-8">
                <Col span={24}>
                    <Card title="Quick Actions" bordered={false} className="shadow-sm">
                        <p>Welcome to the admin dashboard. Use the sidebar to manage doctors.</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
