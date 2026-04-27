import { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Typography, App, Row, Col, Space, TimePicker, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api/axios';

const { Title, Paragraph } = Typography;

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DoctorProfile = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/doctor/profile');
        const profile = response.data;
        
        // Convert working hours strings to dayjs objects for TimePicker
        const formattedWorkingHours: any = {};
        if (profile.workingHours) {
          DAYS_OF_WEEK.forEach(day => {
            if (profile.workingHours[day]) {
              formattedWorkingHours[day] = profile.workingHours[day].map((block: any) => ({
                timeRange: [
                  dayjs(block.start, 'HH:mm'),
                  dayjs(block.end, 'HH:mm')
                ]
              }));
            }
          });
        }

        form.setFieldsValue({
          specialization: profile.specialization,
          fee: profile.fee,
          slotDuration: profile.slotDuration,
          workingHours: formattedWorkingHours
        });
      } catch (error: any) {
        if (error.response?.status !== 404) {
           message.error('Failed to load profile data');
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [form, message]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Convert dayjs objects back to strings "HH:mm"
      const formattedWorkingHours: any = {};
      DAYS_OF_WEEK.forEach(day => {
        if (values.workingHours && values.workingHours[day]) {
          formattedWorkingHours[day] = values.workingHours[day]
            .filter((block: any) => block && block.timeRange && block.timeRange.length === 2)
            .map((block: any) => ({
              start: block.timeRange[0].format('HH:mm'),
              end: block.timeRange[1].format('HH:mm')
            }));
        } else {
          formattedWorkingHours[day] = [];
        }
      });

      const payload = {
        ...values,
        workingHours: formattedWorkingHours
      };

      await api.put('/doctor/profile', payload);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div>
      <Title level={3}>Profile & Schedule Settings</Title>
      <Paragraph type="secondary">Manage your professional details and availability.</Paragraph>

      <Card className="mt-4 shadow-sm border border-gray-100 rounded-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ slotDuration: 30 }}
        >
          <Title level={4}>Professional Details</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                <Input placeholder="e.g. Cardiologist" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="fee" label="Consultation Fee ($)" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="slotDuration" label="Slot Duration (minutes)" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={5} step={5} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Working Hours</Title>
          <Paragraph type="secondary">Set your available time blocks for each day. You can add multiple blocks per day (e.g. Morning and Evening).</Paragraph>

          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="capitalize font-semibold mb-2">{day}</h4>
              <Form.List name={['workingHours', day]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'timeRange']}
                          rules={[{ required: true, message: 'Missing time range' }]}
                        >
                          <TimePicker.RangePicker format="HH:mm" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Time Block
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          ))}

          <Form.Item className="mt-6 text-right">
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Save Profile Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
