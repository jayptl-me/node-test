const fs = require('fs');
const path = require('path');

// API Testing Examples and Usage Guide

const API_BASE_URL = 'http://localhost:3000/api/v1';

const examples = {
    // Health Check
    healthCheck: {
        method: 'GET',
        url: `${API_BASE_URL}/health`,
        description: 'Check if the API is running'
    },

    // User Operations
    createUser: {
        method: 'POST',
        url: `${API_BASE_URL}/users`,
        headers: { 'Content-Type': 'application/json' },
        body: {
            name: 'John Doe',
            email: 'john.doe@example.com'
        },
        description: 'Create a new user'
    },

    getAllUsers: {
        method: 'GET',
        url: `${API_BASE_URL}/users`,
        description: 'Get all users'
    },

    getUserById: {
        method: 'GET',
        url: `${API_BASE_URL}/users/1`,
        description: 'Get user by ID'
    },

    // Event Operations
    createEvent: {
        method: 'POST',
        url: `${API_BASE_URL}/events`,
        headers: { 'Content-Type': 'application/json' },
        body: {
            title: 'Tech Conference 2024',
            dateTime: '2024-12-25T10:00:00Z',
            location: 'San Francisco',
            capacity: 100
        },
        description: 'Create a new event'
    },

    getEventDetails: {
        method: 'GET',
        url: `${API_BASE_URL}/events/1`,
        description: 'Get event details with registered users'
    },

    listUpcomingEvents: {
        method: 'GET',
        url: `${API_BASE_URL}/events`,
        description: 'List all upcoming events (sorted by date, then location)'
    },

    getEventStats: {
        method: 'GET',
        url: `${API_BASE_URL}/events/1/stats`,
        description: 'Get event statistics (registrations, capacity, percentage)'
    },

    // Registration Operations
    registerForEvent: {
        method: 'POST',
        url: `${API_BASE_URL}/events/1/register`,
        headers: { 'Content-Type': 'application/json' },
        body: {
            userId: 1
        },
        description: 'Register a user for an event'
    },

    cancelRegistration: {
        method: 'DELETE',
        url: `${API_BASE_URL}/events/1/register`,
        headers: { 'Content-Type': 'application/json' },
        body: {
            userId: 1
        },
        description: 'Cancel user registration for an event'
    }
};

// Generate cURL commands
const generateCurlCommands = () => {
    let curlCommands = '# Event Management API - cURL Examples\\n\\n';

    Object.entries(examples).forEach(([key, example]) => {
        curlCommands += `## ${example.description}\\n`;

        let curlCmd = `curl -X ${example.method}`;

        if (example.headers) {
            Object.entries(example.headers).forEach(([header, value]) => {
                curlCmd += ` -H "${header}: ${value}"`;
            });
        }

        if (example.body) {
            curlCmd += ` -d '${JSON.stringify(example.body, null, 2)}'`;
        }

        curlCmd += ` "${example.url}"`;

        curlCommands += '```bash\\n' + curlCmd + '\\n```\\n\\n';
    });

    return curlCommands;
};

// Generate Postman collection
const generatePostmanCollection = () => {
    const collection = {
        info: {
            name: 'Event Management API',
            description: 'Complete API collection for Event Management system',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: []
    };

    Object.entries(examples).forEach(([key, example]) => {
        const item = {
            name: example.description,
            request: {
                method: example.method,
                header: [],
                url: {
                    raw: example.url,
                    host: ['localhost'],
                    port: '3000',
                    path: example.url.replace('http://localhost:3000', '').split('/')
                }
            }
        };

        if (example.headers) {
            Object.entries(example.headers).forEach(([header, value]) => {
                item.request.header.push({
                    key: header,
                    value: value
                });
            });
        }

        if (example.body) {
            item.request.body = {
                mode: 'raw',
                raw: JSON.stringify(example.body, null, 2),
                options: {
                    raw: {
                        language: 'json'
                    }
                }
            };
        }

        collection.item.push(item);
    });

    return JSON.stringify(collection, null, 2);
};

// Write files
const curlContent = generateCurlCommands();
const postmanContent = generatePostmanCollection();

fs.writeFileSync(path.join(__dirname, '..', '..', 'API_EXAMPLES.md'), curlContent);
fs.writeFileSync(path.join(__dirname, '..', '..', 'postman_collection.json'), postmanContent);

console.log('API testing files generated:');
console.log('- API_EXAMPLES.md (cURL commands)');
console.log('- postman_collection.json (Postman collection)');

module.exports = { examples };
