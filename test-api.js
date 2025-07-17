#!/usr/bin/env bun

/**
 * Comprehensive API Testing Script
 * This script demonstrates all the Event Management API functionality
 * Run this after starting the server to test all endpoints
 */

const BASE_URL = 'http://localhost:3000/api/v1';
const { cleanDatabase } = require('./src/database/clean');

// Helper function to make HTTP requests
async function makeRequest(method, url, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data, ok: response.ok };
    } catch (error) {
        return { status: 0, data: { error: error.message }, ok: false };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\\n🏥 Testing Health Check...');
    const result = await makeRequest('GET', `${BASE_URL}/health`);
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    return result.ok;
}

async function testCreateUsers() {
    console.log('\\n👥 Testing User Creation...');


    // Use unique emails for each run
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const users = [
        { name: 'Test User 1', email: `testuser1+${unique}@example.com` },
        { name: 'Test User 2', email: `testuser2+${unique}@example.com` },
        { name: 'Test User 3', email: `testuser3+${unique}@example.com` }
    ];

    const createdUsers = [];

    for (const user of users) {
        const result = await makeRequest('POST', `${BASE_URL}/users`, user);
        console.log(`Creating ${user.name}: Status ${result.status}`);
        if (result.ok) {
            createdUsers.push(result.data.data);
        } else {
            console.log('Error:', result.data);
        }
    }

    return createdUsers;
}

async function testCreateEvents() {
    console.log('\\n📅 Testing Event Creation...');

    const events = [
        {
            title: 'Test Conference 2026',
            dateTime: '2026-12-25T10:00:00Z',
            location: 'Test City A',
            capacity: 50
        },
        {
            title: 'Workshop 2026',
            dateTime: '2026-11-15T14:00:00Z',
            location: 'Test City B',
            capacity: 25
        },
        {
            title: 'Meetup 2026',
            dateTime: '2026-12-01T18:00:00Z',
            location: 'Test City A',
            capacity: 100
        }
    ];

    const createdEvents = [];

    for (const event of events) {
        const result = await makeRequest('POST', `${BASE_URL}/events`, event);
        console.log(`Creating ${event.title}: Status ${result.status}`);
        if (result.ok) {
            createdEvents.push(result.data.data);
        } else {
            console.log('Error:', result.data);
        }
    }

    return createdEvents;
}

async function testEventRegistrations(users, events) {
    console.log('\\n📝 Testing Event Registrations...');

    if (users.length === 0 || events.length === 0) {
        console.log('Skipping registrations - no users or events available');
        return;
    }

    // Test successful registration
    const user = users[0];
    const event = events[0];

    console.log(`Registering ${user.name} for ${event.event.title}...`);
    let result = await makeRequest('POST', `${BASE_URL}/events/${event.eventId}/register`, {
        userId: user.id
    });
    console.log(`Registration Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    // Test duplicate registration (should fail)
    console.log(`\\nTesting duplicate registration...`);
    result = await makeRequest('POST', `${BASE_URL}/events/${event.eventId}/register`, {
        userId: user.id
    });
    console.log(`Duplicate Registration Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    // Register another user
    if (users.length > 1) {
        const user2 = users[1];
        console.log(`\\nRegistering ${user2.name} for ${event.event.title}...`);
        result = await makeRequest('POST', `${BASE_URL}/events/${event.eventId}/register`, {
            userId: user2.id
        });
        console.log(`Registration Status: ${result.status}`);
    }
}

async function testEventDetails(events) {
    console.log('\\n📋 Testing Event Details...');

    if (events.length === 0) {
        console.log('No events to test');
        return;
    }

    const event = events[0];
    const result = await makeRequest('GET', `${BASE_URL}/events/${event.eventId}`);
    console.log(`Event Details Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testUpcomingEvents() {
    console.log('\\n📆 Testing Upcoming Events List...');

    const result = await makeRequest('GET', `${BASE_URL}/events`);
    console.log(`Upcoming Events Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testEventStats(events) {
    console.log('\\n📊 Testing Event Statistics...');

    if (events.length === 0) {
        console.log('No events to test');
        return;
    }

    const event = events[0];
    const result = await makeRequest('GET', `${BASE_URL}/events/${event.eventId}/stats`);
    console.log(`Event Stats Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testCancelRegistration(users, events) {
    console.log('\\n❌ Testing Registration Cancellation...');

    if (users.length === 0 || events.length === 0) {
        console.log('Skipping cancellation - no users or events available');
        return;
    }

    const user = users[0];
    const event = events[0];

    console.log(`Cancelling registration for ${user.name} from ${event.event.title}...`);
    const result = await makeRequest('DELETE', `${BASE_URL}/events/${event.eventId}/register`, {
        userId: user.id
    });
    console.log(`Cancellation Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testValidationErrors() {
    console.log('\\n🚨 Testing Validation Errors...');

    // Test invalid event creation
    console.log('Testing invalid event (capacity > 1000)...');
    let result = await makeRequest('POST', `${BASE_URL}/events`, {
        title: 'Invalid Event',
        dateTime: '2026-12-25T10:00:00Z',
        location: 'Test City',
        capacity: 1500
    });
    console.log(`Invalid Event Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    // Test past date event
    console.log('\\nTesting past date event...');
    result = await makeRequest('POST', `${BASE_URL}/events`, {
        title: 'Past Event',
        dateTime: '2020-01-01T10:00:00Z',
        location: 'Test City',
        capacity: 50
    });
    console.log(`Past Event Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    // Test invalid user creation
    console.log('\\nTesting invalid user (invalid email)...');
    result = await makeRequest('POST', `${BASE_URL}/users`, {
        name: 'Test User',
        email: 'invalid-email'
    });
    console.log(`Invalid User Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testNotFoundErrors() {
    console.log('\\n🔍 Testing Not Found Errors...');

    // Test non-existent event
    console.log('Testing non-existent event...');
    let result = await makeRequest('GET', `${BASE_URL}/events/99999`);
    console.log(`Non-existent Event Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    // Test non-existent user
    console.log('\\nTesting non-existent user...');
    result = await makeRequest('GET', `${BASE_URL}/users/99999`);
    console.log(`Non-existent User Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Event Management API Tests');
    console.log('==========================================');

    try {
        // Clean DB before running tests
        console.log('🧹 Cleaning database...');
        await cleanDatabase();
        // Basic functionality tests
        await testHealthCheck();

        const users = await testCreateUsers();
        const events = await testCreateEvents();

        await testEventRegistrations(users, events);
        await testEventDetails(events);
        await testUpcomingEvents();
        await testEventStats(events);
        await testCancelRegistration(users, events);
        await getAllUserEvents(users[0].id);

        // Error handling tests
        await testValidationErrors();
        await testNotFoundErrors();

        console.log('\n✅ All tests completed!');
        console.log('==========================================');

    } catch (error) {
        console.error('\n❌ Test execution failed:', error);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}

// Run tests
(async () => {
    console.log('Checking if server is running...');

    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running!');
        console.log('Please start the server first:');
        console.log('  bun run dev');
        console.log('  or');
        console.log('  bun run start');
        process.exit(1);
    }

    console.log('✅ Server is running!');
    await runAllTests();
})();

// --- Jest-style tests for API endpoints ---
// To run these, you can use a test runner like Jest or Bun's test runner
// These are basic examples; you may want to split them into separate files for a real project

if (typeof test === 'function') {
    test('Health check endpoint returns success', async () => {
        const result = await makeRequest('GET', `${BASE_URL}/health`);
        expect(result.ok).toBe(true);
        expect(result.data.success).toBe(true);
    });

    test('User creation works', async () => {
        const user = { name: 'Test Jest User', email: 'jestuser@example.com' };
        const result = await makeRequest('POST', `${BASE_URL}/users`, user);
        expect(result.ok).toBe(true);
        expect(result.data.data.name).toBe(user.name);
        expect(result.data.data.email).toBe(user.email);
    });

    test('Event creation with valid data works', async () => {
        const event = {
            title: 'Jest Event',
            dateTime: '2026-12-25T10:00:00Z',
            location: 'Jest City',
            capacity: 10
        };
        const result = await makeRequest('POST', `${BASE_URL}/events`, event);
        expect(result.ok).toBe(true);
        expect(result.data.data.event.title).toBe(event.title);
    });

    test('Event creation with past date fails', async () => {
        const event = {
            title: 'Past Jest Event',
            dateTime: '2020-01-01T10:00:00Z',
            location: 'Jest City',
            capacity: 10
        };
        const result = await makeRequest('POST', `${BASE_URL}/events`, event);
        expect(result.ok).toBe(false);
        expect(result.data.message).toMatch(/Validation failed/);
    });

    test('Event registration and duplicate registration', async () => {
        // Create user
        const user = { name: 'Reg User', email: 'reguser@example.com' };
        const userRes = await makeRequest('POST', `${BASE_URL}/users`, user);
        expect(userRes.ok).toBe(true);
        const userId = userRes.data.data.id;
        // Create event
        const event = {
            title: 'Reg Event',
            dateTime: '2026-12-25T10:00:00Z',
            location: 'Reg City',
            capacity: 5
        };
        const eventRes = await makeRequest('POST', `${BASE_URL}/events`, event);
        expect(eventRes.ok).toBe(true);
        const eventId = eventRes.data.data.eventId;
        // Register
        const regRes = await makeRequest('POST', `${BASE_URL}/events/${eventId}/register`, { userId });
        expect(regRes.ok).toBe(true);
        // Duplicate registration
        const dupRes = await makeRequest('POST', `${BASE_URL}/events/${eventId}/register`, { userId });
        expect(dupRes.ok).toBe(false);
    });

    test('Get event details and stats', async () => {
        // Create event
        const event = {
            title: 'Stats Event',
            dateTime: '2026-12-25T10:00:00Z',
            location: 'Stats City',
            capacity: 5
        };
        const eventRes = await makeRequest('POST', `${BASE_URL}/events`, event);
        expect(eventRes.ok).toBe(true);
        const eventId = eventRes.data.data.eventId;
        // Get details
        const detailsRes = await makeRequest('GET', `${BASE_URL}/events/${eventId}`);
        expect(detailsRes.ok).toBe(true);
        expect(detailsRes.data.data.event.title).toBe(event.title);
        // Get stats
        const statsRes = await makeRequest('GET', `${BASE_URL}/events/${eventId}/stats`);
        expect(statsRes.ok).toBe(true);
    });

    test('Cancel registration', async () => {
        // Create user
        const user = { name: 'Cancel User', email: 'canceluser@example.com' };
        const userRes = await makeRequest('POST', `${BASE_URL}/users`, user);
        expect(userRes.ok).toBe(true);
        const userId = userRes.data.data.id;
        // Create event
        const event = {
            title: 'Cancel Event',
            dateTime: '2026-12-25T10:00:00Z',
            location: 'Cancel City',
            capacity: 5
        };
        const eventRes = await makeRequest('POST', `${BASE_URL}/events`, event);
        expect(eventRes.ok).toBe(true);
        const eventId = eventRes.data.data.eventId;
        // Register
        const regRes = await makeRequest('POST', `${BASE_URL}/events/${eventId}/register`, { userId });
        expect(regRes.ok).toBe(true);
        // Cancel
        const cancelRes = await makeRequest('DELETE', `${BASE_URL}/events/${eventId}/register`, { userId });
        expect(cancelRes.ok).toBe(true);
    });

    test('Not found errors for non-existent user and event', async () => {
        const userRes = await makeRequest('GET', `${BASE_URL}/users/999999`);
        expect(userRes.ok).toBe(false);
        const eventRes = await makeRequest('GET', `${BASE_URL}/events/999999`);
        expect(eventRes.ok).toBe(false);
    });

    test('Validation error for invalid user email', async () => {
        const user = { name: 'Invalid Email', email: 'not-an-email' };
        const result = await makeRequest('POST', `${BASE_URL}/users`, user);
        expect(result.ok).toBe(false);
        expect(result.data.message).toMatch(/Validation failed/);
    });
}
