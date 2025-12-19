const axios = require('axios');

// CONFIG
const API_URL = 'http://localhost:3000/api';
const EMAIL = 'test_user_' + Date.now() + '@example.com';
const PASSWORD = 'password123';
const TEST_DATE = '2025-12-25'; // Ensure this is in the future
const TEST_TIME = '10:00 AM';

async function runTest() {
    try {
        console.log('--- STARTING BOOKING VERIFICATION TEST ---');

        // 1. REGISTER / LOGIN USER
        console.log(`\n1. Creating Test User (${EMAIL})...`);
        let token;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                email: EMAIL,
                password: PASSWORD,
                phone: '1234567890'
            });
            token = regRes.data.data.token;
            console.log('✅ User registered & logged in.');
        } catch (e) {
            console.error('❌ Registration failed:', e.response?.data || e.message);
            return;
        }

        // 2. GET A DOCTOR
        console.log('\n2. Fetching a Doctor to book...');
        let doctorId;
        try {
            const docRes = await axios.get(`${API_URL}/doctors`);
            if (docRes.data.data.length === 0) {
                console.error('❌ No doctors found. Create a doctor first.');
                return;
            }
            doctorId = docRes.data.data[0].id;
            console.log(`✅ Found Doctor: ${docRes.data.data[0].name} (ID: ${doctorId})`);
        } catch (e) {
            console.error('❌ Fetch doctors failed:', e.response?.data || e.message);
            return;
        }

        // 3. CHECK AVAILABILITY BEFORE BOOKING
        console.log(`\n3. Checking slots for ${TEST_DATE}...`);
        try {
            const slotsRes = await axios.get(`${API_URL}/doctors/${doctorId}/slots/${TEST_DATE}`);
            const available = slotsRes.data.data.availableSlots;
            if (!available.includes(TEST_TIME)) {
                console.warn(`⚠️ Slot ${TEST_TIME} is not in default slots. Using first available: ${available[0]}`);
                // Use first available if 10:00 AM is not there
                if (available.length > 0) TEST_TIME = available[0];
                else {
                    console.error('❌ No slots available to test.');
                    return;
                }
            }
            console.log(`✅ Slot ${TEST_TIME} is available.`);
        } catch (e) {
            console.error('❌ Get slots failed:', e.response?.data || e.message);
            return;
        }

        // 4. BOOK THE APPOINTMENT
        console.log(`\n4. Booking appointment for ${TEST_TIME}...`);
        try {
            const bookRes = await axios.post(
                `${API_URL}/appointments/book`,
                { doctorId, date: TEST_DATE, time: TEST_TIME, reason: 'Test Booking' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('✅ Appointment booked successfully (ID:', bookRes.data.data.id, ')');
        } catch (e) {
            console.error('❌ Booking failed:', e.response?.data || e.message);
            return;
        }

        // 5. VERIFY SLOT IS GONE
        console.log(`\n5. Verifying slot ${TEST_TIME} is now UNAVAILABLE...`);
        try {
            const slotsRes = await axios.get(`${API_URL}/doctors/${doctorId}/slots/${TEST_DATE}`);
            const available = slotsRes.data.data.availableSlots;
            const booked = slotsRes.data.data.bookedSlots;

            if (available.includes(TEST_TIME)) {
                console.error('❌ FAILED: Slot is still available!');
            } else if (booked.includes(TEST_TIME)) {
                console.log('✅ SUCCESS: Slot is marked as booked and removed from available list.');
            } else {
                console.log('✅ SUCCESS: Slot is removed from available list (and maybe not in booked list if logic differs, but unavailability is key).');
            }
        } catch (e) {
            console.error('❌ Get slots failed:', e.response?.data || e.message);
        }

        // 6. ATTEMPT DOUBLE BOOKING
        console.log(`\n6. Attempting to book ${TEST_TIME} again (Double Booking)...`);
        try {
            await axios.post(
                `${API_URL}/appointments/book`,
                { doctorId, date: TEST_DATE, time: TEST_TIME, reason: 'Double Booking Test' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.error('❌ FAILED: Double booking was allowed!');
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data.code === 'SLOT_BOOKED') {
                console.log('✅ SUCCESS: Double booking prevented with 400 SLOT_BOOKED.');
            } else {
                console.error('❌ Unexpected error during double booking:', e.response?.data || e.message);
            }
        }

        console.log('\n--- TEST COMPLETE ---');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

runTest();
