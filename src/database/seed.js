const User = require('../models/User');
const Event = require('../models/Event');

const seedData = async () => {
    try {
        console.log('Starting data seeding...');

        // Create sample users
        const users = [
            { name: 'John Doe', email: 'john.doe@example.com' },
            { name: 'Jane Smith', email: 'jane.smith@example.com' },
            { name: 'Bob Johnson', email: 'bob.johnson@example.com' },
            { name: 'Alice Brown', email: 'alice.brown@example.com' },
            { name: 'Charlie Wilson', email: 'charlie.wilson@example.com' }
        ];

        const createdUsers = [];
        for (const userData of users) {
            try {
                const user = await User.create(userData.name, userData.email);
                createdUsers.push(user);
                console.log(`Created user: ${user.name}`);
            } catch (error) {
                if (error.code === '23505') {
                    console.log(`User ${userData.email} already exists, skipping...`);
                    const existingUser = await User.findByEmail(userData.email);
                    createdUsers.push(existingUser);
                } else {
                    throw error;
                }
            }
        }

        // Create sample events
        const events = [
            {
                title: 'Tech Conference 2024',
                dateTime: '2024-12-25T10:00:00Z',
                location: 'San Francisco',
                capacity: 100
            },
            {
                title: 'JavaScript Workshop',
                dateTime: '2024-11-15T14:00:00Z',
                location: 'New York',
                capacity: 50
            },
            {
                title: 'AI Summit',
                dateTime: '2024-12-01T09:00:00Z',
                location: 'Boston',
                capacity: 200
            },
            {
                title: 'Web Development Bootcamp',
                dateTime: '2024-10-30T16:00:00Z',
                location: 'Seattle',
                capacity: 75
            },
            {
                title: 'Cloud Computing Meetup',
                dateTime: '2024-11-20T18:00:00Z',
                location: 'Austin',
                capacity: 30
            }
        ];

        const createdEvents = [];
        for (const eventData of events) {
            try {
                const event = await Event.create(
                    eventData.title,
                    eventData.dateTime,
                    eventData.location,
                    eventData.capacity
                );
                createdEvents.push(event);
                console.log(`Created event: ${event.title}`);
            } catch (error) {
                console.log(`Event might already exist: ${eventData.title}`);
            }
        }

        // Register some users for events (optional)
        if (createdUsers.length > 0 && createdEvents.length > 0) {
            console.log('Creating sample registrations...');

            // Register first user for first event
            try {
                await Event.registerUser(createdEvents[0].id, createdUsers[0].id);
                console.log(`Registered ${createdUsers[0].name} for ${createdEvents[0].title}`);
            } catch (error) {
                console.log('Registration might already exist');
            }

            // Register second user for first event
            try {
                await Event.registerUser(createdEvents[0].id, createdUsers[1].id);
                console.log(`Registered ${createdUsers[1].name} for ${createdEvents[0].title}`);
            } catch (error) {
                console.log('Registration might already exist');
            }

            // Register first user for second event
            try {
                await Event.registerUser(createdEvents[1].id, createdUsers[0].id);
                console.log(`Registered ${createdUsers[0].name} for ${createdEvents[1].title}`);
            } catch (error) {
                console.log('Registration might already exist');
            }
        }

        console.log('Data seeding completed successfully!');
        console.log(`Created ${createdUsers.length} users and ${createdEvents.length} events`);
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
};

// Run seeder if this file is executed directly
if (require.main === module) {
    seedData().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
}

module.exports = { seedData };
