import React, { useState, useEffect } from 'react';
// const { updateDefaultSlots, updateDateSchedule, deleteDateSchedule } = useDoctorStore();
// Removed unused loading from here, it seems loading is used in line 17 but shadowed or duplicated?
// Wait, line 17: const [loading, setLoading] = useState(false);
// Line 132 in error log says 'loading' is declared but never read.
// Let's check line 132. It's in `renderSlotEditor` params.

// Fixes based on error log:
// 1. Space, DeleteOutlined unused in imports.
// 2. date unused in onDateChange.
// 3. loading unused in renderSlotEditor.

// Let's just fix the specific lines.

// Fix imports
import { Modal, Tabs, Tag, Input, Button, DatePicker, message, Spin } from 'antd';
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDoctorStore } from './doctorStore';
import type { Doctor } from '../../types';
import axiosClient from '../../api/axiosClient';

interface ScheduleModalProps {
    doctor: Doctor | null;
    open: boolean;
    onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ doctor, open, onClose }) => {
    const { updateDefaultSlots, updateDateSchedule, deleteDateSchedule } = useDoctorStore();
    const [loading, setLoading] = useState(false);

    // Default Slots State
    const [defaultSlots, setDefaultSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState('');

    // Specific Date State
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [dateSlots, setDateSlots] = useState<string[]>([]);
    const [dateLoading, setDateLoading] = useState(false);
    const [newDateSlot, setNewDateSlot] = useState('');

    useEffect(() => {
        if (doctor && open) {
            setDefaultSlots(doctor.defaultTimeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']);
            setSelectedDate('');
            setDateSlots([]);
        }
    }, [doctor, open]);

    // --- DEFAULT SLOTS HANDLERS ---
    const handleAddDefaultSlot = () => {
        if (newSlot && !defaultSlots.includes(newSlot)) {
            setDefaultSlots([...defaultSlots, newSlot].sort());
            setNewSlot('');
        }
    };

    const handleRemoveDefaultSlot = (slot: string) => {
        setDefaultSlots(defaultSlots.filter(s => s !== slot));
    };

    const handleSaveDefault = async () => {
        if (!doctor) return;
        setLoading(true);
        try {
            await updateDefaultSlots(doctor.id, defaultSlots);
            message.success('Default slots updated');
            onClose();
        } catch (error) {
            message.error('Failed to update slots');
        } finally {
            setLoading(false);
        }
    };

    // --- DATE SPECIFIC HANDLERS ---
    const onDateChange = async (_date: dayjs.Dayjs | null, dateString: string) => {
        if (!dateString || !doctor) return;
        setSelectedDate(dateString);
        setDateLoading(true);
        try {
            // Fetch slots for this date (using existing endpoint)
            const res = await axiosClient.get(`/doctors/${doctor.id}/slots/${dateString}`);
            if (res.data.success) {
                // The endpoint returns `timeSlots` which is the effective list (override or default)
                // To know if it's an override, we might need to check logic, but here we just show what's active.
                // To strictly edit overrides, we should ideally fetch the schedule object directly, but let's just edit the "active" list.
                setDateSlots(res.data.data.timeSlots || []);
            }
        } catch (error) {
            message.error("Could not fetch schedule for date");
        } finally {
            setDateLoading(false);
        }
    };

    const handleAddDateSlot = () => {
        if (newDateSlot && !dateSlots.includes(newDateSlot)) {
            setDateSlots([...dateSlots, newDateSlot].sort());
            setNewDateSlot('');
        }
    };

    const handleRemoveDateSlot = (slot: string) => {
        setDateSlots(dateSlots.filter(s => s !== slot));
    };

    const handleSaveDate = async () => {
        if (!doctor || !selectedDate) return;
        setLoading(true);
        try {
            await updateDateSchedule(doctor.id, selectedDate, dateSlots);
            message.success(`Schedule for ${selectedDate} updated`);
        } catch (error) {
            message.error('Failed to update date schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleRevertDate = async () => {
        if (!doctor || !selectedDate) return;
        setLoading(true);
        try {
            await deleteDateSchedule(doctor.id, selectedDate);
            message.success(`Reverted ${selectedDate} to default schedule`);
            // Refetch to show defaults
            const res = await axiosClient.get(`/doctors/${doctor.id}/slots/${selectedDate}`);
            if (res.data.success) {
                setDateSlots(res.data.data.timeSlots || []);
            }
        } catch (error) {
            message.error('Failed to revert schedule');
        } finally {
            setLoading(false);
        }
    };

    const renderSlotEditor = (
        slots: string[],
        onRemove: (s: string) => void,
        newVal: string,
        setNewVal: (v: string) => void,
        onAdd: () => void,
        // loading: boolean // Removed unused parameter
    ) => (
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    placeholder="e.g. 05:00 PM"
                    value={newVal}
                    onChange={e => setNewVal(e.target.value)}
                    style={{ width: 150 }}
                    onPressEnter={onAdd}
                />
                <Button icon={<PlusOutlined />} onClick={onAdd}>Add Slot</Button>
            </div>

            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded min-h-[100px] border border-gray-200">
                {slots.length === 0 && <span className="text-gray-400">No slots defined.</span>}
                {slots.map(slot => (
                    <Tag
                        key={slot}
                        closable
                        onClose={() => onRemove(slot)}
                        color="blue"
                        style={{ fontSize: '14px', padding: '4px 10px' }}
                    >
                        {slot}
                    </Tag>
                ))}
            </div>
        </div>
    );

    return (
        <Modal
            title={`Manage Schedule - ${doctor?.name}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: <span><ClockCircleOutlined /> Default Weekly Slots</span>,
                    children: (
                        <div>
                            <p className="text-gray-500 mb-2">These slots will be applied to every day unless overridden.</p>
                            {renderSlotEditor(defaultSlots, handleRemoveDefaultSlot, newSlot, setNewSlot, handleAddDefaultSlot)}
                            <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={onClose}>Cancel</Button>
                                <Button type="primary" loading={loading} onClick={handleSaveDefault}>Save Defaults</Button>
                            </div>
                        </div>
                    )
                },
                {
                    key: '2',
                    label: <span><CalendarOutlined /> Specific Date Override</span>,
                    children: (
                        <div>
                            <p className="text-gray-500 mb-4">Select a date to customize slots for that specific day.</p>
                            <div className="flex justify-between items-center mb-4">
                                <DatePicker onChange={onDateChange as any} style={{ width: 250 }} />
                                {selectedDate && (
                                    <Button danger onClick={handleRevertDate} loading={loading}>Revert to Default</Button>
                                )}
                            </div>

                            {selectedDate ? (
                                <Spin spinning={dateLoading}>
                                    {renderSlotEditor(dateSlots, handleRemoveDateSlot, newDateSlot, setNewDateSlot, handleAddDateSlot)}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="primary" loading={loading} onClick={handleSaveDate}>Save Override</Button>
                                    </div>
                                </Spin>
                            ) : (
                                <div className="text-center py-10 text-gray-400">Please select a date first.</div>
                            )}
                        </div>
                    )
                }
            ]} />
        </Modal>
    );
};

export default ScheduleModal;
