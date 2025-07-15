#!/usr/bin/env bun

/**
 * Comprehensive API Testing Script
 * This script demonstrates all the Event Management API functionality
 * Run this after starting the server to test all endpoints
 */

const BASE_URL = 'http://localhost:3000/api/v1';

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

    const users = [
        { name: 'Test User 1', email: 'testuser1@example.com' },
        { name: 'Test User 2', email: 'testuser2@example.com' },
        { name: 'Test User 3', email: 'testuser3@example.com' }
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
            title: 'Test Conference 2024',
            dateTime: '2024-12-25T10:00:00Z',
            location: 'Test City A',
            capacity: 50
        },
        {
            title: 'Workshop 2024',
            dateTime: '2024-11-15T14:00:00Z',
            location: 'Test City B',
            capacity: 25
        },
        {
            title: 'Meetup 2024',
            dateTime: '2024-12-01T18:00:00Z',
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
        dateTime: '2024-12-25T10:00:00Z',
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
        // Basic functionality tests
        await testHealthCheck();

        const users = await testCreateUsers();
        const events = await testCreateEvents();

        await testEventRegistrations(users, events);
        await testEventDetails(events);
        await testUpcomingEvents();
        await testEventStats(events);
        await testCancelRegistration(users, events);

        // Error handling tests
        await testValidationErrors();
        await testNotFoundErrors();

        console.log('\\n✅ All tests completed!');
        console.log('==========================================');

    } catch (error) {
        console.error('\\n❌ Test execution failed:', error);
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
