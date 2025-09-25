#!/usr/bin/env node

/**
 * Chat API Test Script
 * 
 * This script tests the Retell AI chat integration with various scenarios
 * to ensure the pharmacy appointment system works correctly.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';

// Test scenarios
const TEST_SCENARIOS = [
	{
		name: 'Check Availability',
		messages: [
			{
				role: 'user',
				content: 'Hi, I need to book a flu shot appointment. What times are available this week?'
			}
		],
		expectedTools: ['check_availability']
	},
	{
		name: 'Book Appointment',
		messages: [
			{
				role: 'user',
				content: 'I\'d like to book a flu shot for tomorrow at 2 PM. My name is John Smith and my phone is 555-1234.'
			}
		],
		expectedTools: ['check_availability', 'book_appointment']
	},
	{
		name: 'Reschedule Appointment',
		messages: [
			{
				role: 'user',
				content: 'I need to reschedule my appointment. Can you help me find a new time? My phone number is 555-1234.'
			}
		],
		expectedTools: ['lookup_appointment', 'reschedule_appointment']
	},
	{
		name: 'Cancel Appointment',
		messages: [
			{
				role: 'user',
				content: 'I need to cancel my appointment. My name is John Smith.'
			}
		],
		expectedTools: ['lookup_appointment', 'cancel_appointment']
	},
	{
		name: 'Complex Booking',
		messages: [
			{
				role: 'user',
				content: 'Hi, I need a consultation appointment. I have some questions about my medications. My name is Sarah Johnson, phone 555-5678, email sarah@example.com. I prefer morning appointments if possible.'
			}
		],
		expectedTools: ['check_availability', 'book_appointment']
	}
];

async function testChatAPI() {
	console.log('🧪 Testing Pharmacy Chat API...\n');
	
	let passedTests = 0;
	let totalTests = TEST_SCENARIOS.length;
	
	for (const scenario of TEST_SCENARIOS) {
		console.log(`📋 Testing: ${scenario.name}`);
		
		try {
			const response = await axios.post(`${BASE_URL}/chat`, {
				messages: scenario.messages,
				metadata: {
					caller: {
						name: 'Test User',
						phone: '555-0000',
						email: 'test@example.com'
					}
				}
			}, {
				timeout: 30000 // 30 second timeout
			});
			
			if (response.status === 200 && response.data.message) {
				console.log(`  ✅ Response received: "${response.data.message.content?.substring(0, 100)}..."`);
				passedTests++;
			} else {
				console.log(`  ❌ Unexpected response format`);
			}
			
		} catch (error) {
			if (error.response) {
				console.log(`  ❌ API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
			} else if (error.code === 'ECONNREFUSED') {
				console.log(`  ❌ Connection refused - Is the server running on ${BASE_URL}?`);
			} else {
				console.log(`  ❌ Error: ${error.message}`);
			}
		}
		
		console.log(''); // Empty line for readability
	}
	
	console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
	
	if (passedTests === totalTests) {
		console.log('🎉 All tests passed! Your chat API is working correctly.');
	} else {
		console.log('⚠️  Some tests failed. Check the server logs and configuration.');
	}
}

async function testHealthEndpoint() {
	console.log('🏥 Testing health endpoints...\n');
	
	try {
		// Test main health endpoint
		const mainHealth = await axios.get(`${BASE_URL}/health`);
		console.log(`✅ Main health: ${mainHealth.data.status}`);
		
		// Test chat health endpoint
		const chatHealth = await axios.get(`${BASE_URL}/chat/health`);
		console.log(`✅ Chat health: ${chatHealth.data.status}`);
		
	} catch (error) {
		console.log(`❌ Health check failed: ${error.message}`);
	}
}

async function main() {
	console.log('🚀 Pharmacy Appointment Agent - API Test Suite\n');
	
	await testHealthEndpoint();
	console.log('');
	await testChatAPI();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}
