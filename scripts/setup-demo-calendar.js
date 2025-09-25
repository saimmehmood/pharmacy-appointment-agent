#!/usr/bin/env node

/**
 * Demo Calendar Setup Script
 * 
 * This script creates a realistic demo calendar with busy and free slots
 * to test the pharmacy appointment system.
 */

import { google } from 'googleapis';
import dayjs from 'dayjs';

// Configuration
const DEMO_EVENTS = [
	// Monday - Some busy slots
	{ start: '09:00', end: '09:30', title: 'Dr. Smith - Consultation', type: 'busy' },
	{ start: '10:15', end: '10:45', title: 'Flu Shot - John Doe', type: 'busy' },
	{ start: '11:30', end: '12:00', title: 'Medication Review - Jane Smith', type: 'busy' },
	{ start: '14:00', end: '14:30', title: 'Vaccination - Mike Johnson', type: 'busy' },
	{ start: '15:45', end: '16:15', title: 'Consultation - Sarah Wilson', type: 'busy' },
	
	// Tuesday - More busy slots
	{ start: '08:30', end: '09:00', title: 'Flu Shot - Robert Brown', type: 'busy' },
	{ start: '09:45', end: '10:15', title: 'Consultation - Lisa Davis', type: 'busy' },
	{ start: '11:00', end: '11:30', title: 'Medication Review - Tom Miller', type: 'busy' },
	{ start: '13:30', end: '14:00', title: 'Vaccination - Emily Garcia', type: 'busy' },
	{ start: '15:00', end: '15:30', title: 'Flu Shot - David Martinez', type: 'busy' },
	
	// Wednesday - Lighter day
	{ start: '09:30', end: '10:00', title: 'Consultation - Anna Rodriguez', type: 'busy' },
	{ start: '11:15', end: '11:45', title: 'Medication Review - Chris Lee', type: 'busy' },
	{ start: '14:30', end: '15:00', title: 'Vaccination - Maria Gonzalez', type: 'busy' },
	
	// Thursday - Busy day
	{ start: '08:00', end: '08:30', title: 'Flu Shot - James Wilson', type: 'busy' },
	{ start: '09:15', end: '09:45', title: 'Consultation - Jennifer Taylor', type: 'busy' },
	{ start: '10:30', end: '11:00', title: 'Medication Review - Michael Anderson', type: 'busy' },
	{ start: '11:45', end: '12:15', title: 'Vaccination - Amanda Thomas', type: 'busy' },
	{ start: '13:00', end: '13:30', title: 'Flu Shot - Daniel Jackson', type: 'busy' },
	{ start: '14:15', end: '14:45', title: 'Consultation - Rachel White', type: 'busy' },
	{ start: '15:30', end: '16:00', title: 'Medication Review - Kevin Harris', type: 'busy' },
	
	// Friday - Moderate day
	{ start: '09:00', end: '09:30', title: 'Flu Shot - Nicole Clark', type: 'busy' },
	{ start: '10:45', end: '11:15', title: 'Consultation - Brandon Lewis', type: 'busy' },
	{ start: '12:30', end: '13:00', title: 'Vaccination - Stephanie Walker', type: 'busy' },
	{ start: '14:45', end: '15:15', title: 'Medication Review - Tyler Hall', type: 'busy' },
];

function getAuth() {
	const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
	
	if (!clientEmail || !privateKey) {
		throw new Error('Missing Google service account credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY in your .env file.');
	}
	
	return new google.auth.JWT({
		email: clientEmail,
		key: privateKey,
		scopes: ['https://www.googleapis.com/auth/calendar'],
	});
}

function getCalendar() {
	const auth = getAuth();
	return google.calendar({ version: 'v3', auth });
}

async function createDemoEvents() {
	const calendarId = process.env.GOOGLE_CALENDAR_ID;
	
	if (!calendarId) {
		throw new Error('Missing GOOGLE_CALENDAR_ID in your .env file.');
	}
	
	const calendar = getCalendar();
	const today = dayjs();
	
	console.log('🏥 Setting up demo pharmacy calendar...');
	console.log(`📅 Calendar ID: ${calendarId}`);
	console.log(`📆 Creating events for the next 5 business days starting from ${today.format('YYYY-MM-DD')}`);
	
	let createdCount = 0;
	let skippedCount = 0;
	
	for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
		const currentDay = today.add(dayOffset, 'day');
		
		// Skip weekends
		if (currentDay.day() === 0 || currentDay.day() === 6) {
			continue;
		}
		
		const dayName = currentDay.format('dddd');
		console.log(`\n📅 Setting up ${dayName}, ${currentDay.format('YYYY-MM-DD')}`);
		
		// Get events for this day
		const dayEvents = DEMO_EVENTS.filter((_, index) => {
			// Distribute events across days
			return index % 5 === dayOffset;
		});
		
		for (const event of dayEvents) {
			try {
				const startTime = currentDay.hour(parseInt(event.start.split(':')[0])).minute(parseInt(event.start.split(':')[1]));
				const endTime = currentDay.hour(parseInt(event.end.split(':')[0])).minute(parseInt(event.end.split(':')[1]));
				
				// Check if event already exists
				const existingEvents = await calendar.events.list({
					calendarId,
					timeMin: startTime.toISOString(),
					timeMax: endTime.toISOString(),
					singleEvents: true,
					orderBy: 'startTime'
				});
				
				if (existingEvents.data.items && existingEvents.data.items.length > 0) {
					console.log(`  ⏭️  Skipping ${event.title} (already exists)`);
					skippedCount++;
					continue;
				}
				
				// Create the event
				await calendar.events.insert({
					calendarId,
					requestBody: {
						summary: event.title,
						description: `Demo ${event.type} appointment - Created by setup script`,
						start: {
							dateTime: startTime.toISOString(),
							timeZone: 'America/New_York'
						},
						end: {
							dateTime: endTime.toISOString(),
							timeZone: 'America/New_York'
						},
						transparency: 'opaque',
						visibility: 'private'
					}
				});
				
				console.log(`  ✅ Created: ${event.title} (${event.start} - ${event.end})`);
				createdCount++;
				
			} catch (error) {
				console.error(`  ❌ Failed to create ${event.title}:`, error.message);
			}
		}
	}
	
	console.log(`\n🎉 Demo calendar setup complete!`);
	console.log(`📊 Created ${createdCount} new events, skipped ${skippedCount} existing events`);
	console.log(`\n💡 Your calendar now has realistic busy/free slots for testing.`);
	console.log(`🔍 Try booking appointments during free slots or rescheduling existing ones.`);
}

async function main() {
	try {
		// Load environment variables
		import('dotenv').then(dotenv => dotenv.config());
		
		await createDemoEvents();
	} catch (error) {
		console.error('❌ Setup failed:', error.message);
		process.exit(1);
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
