import express from 'express';
import { RetellChatClient, createPharmacySystemPrompt } from '../integrations/retellChat.js';
import { getAvailability } from '../utils/availability.js';
import { createCalendarEvent, findEventByPatient, rescheduleEvent, cancelEvent } from '../integrations/googleCalendar.js';
import { logBooking } from '../integrations/googleSheets.js';

const router = express.Router();

// Initialize Retell client
const retellClient = new RetellChatClient(process.env.RETELL_API_KEY || '');

// Tool execution handler
async function executeTool(toolName: string, args: any, caller?: { name?: string; phone?: string; email?: string }) {
	switch (toolName) {
		case 'check_availability':
			const { appointmentType, from, to, durationMin } = args;
			const slots = await getAvailability({ appointmentType, from, to, durationMin });
			return { 
				success: true, 
				slots: slots.slice(0, 10), // Limit to first 10 slots
				message: `Found ${slots.length} available slots${slots.length > 0 ? '. Here are the next available times:' : '.'}`
			};

		case 'book_appointment':
			const { slotStartIso, patientName, patientPhone, patientEmail, notes } = args;
			if (!patientName || !patientPhone) {
				return { success: false, message: 'Please provide both patient name and phone number to book the appointment.' };
			}
			
			const event = await createCalendarEvent({
				appointmentType: args.appointmentType,
				slotStartIso,
				durationMin: args.durationMin || 20,
				patient: { name: patientName, phone: patientPhone, email: patientEmail },
				notes: notes || ''
			});

			await logBooking({
				kind: 'book',
				eventId: event.id || '',
				startIso: event.start?.dateTime ?? '',
				endIso: event.end?.dateTime ?? '',
				patientName,
				patientPhone,
				patientEmail: patientEmail || '',
				notes: notes || '',
				appointmentType: args.appointmentType || ''
			});

			return { 
				success: true, 
				event,
				message: `Great! I've successfully booked your ${args.appointmentType} appointment for ${new Date(slotStartIso).toLocaleString()}. You'll receive a confirmation email shortly.`
			};

		case 'reschedule_appointment':
			const { lookupKey, newStartIso } = args;
			const rescheduledEvent = await rescheduleEvent({
				lookupKey,
				newStartIso,
				durationMin: args.durationMin || 20,
				patient: caller
			});

			await logBooking({
				kind: 'reschedule',
				eventId: rescheduledEvent.id || '',
				startIso: rescheduledEvent.start?.dateTime ?? '',
				endIso: rescheduledEvent.end?.dateTime ?? '',
				patientName: caller?.name || '',
				patientPhone: caller?.phone || '',
				patientEmail: caller?.email || '',
				notes: '',
				appointmentType: ''
			});

			return { 
				success: true, 
				event: rescheduledEvent,
				message: `Perfect! I've rescheduled your appointment to ${new Date(newStartIso).toLocaleString()}. You'll receive an updated confirmation email.`
			};

		case 'cancel_appointment':
			const cancelledEvent = await cancelEvent({ lookupKey: args.lookupKey, patient: caller });
			
			await logBooking({
				kind: 'cancel',
				eventId: cancelledEvent.id || '',
				startIso: cancelledEvent.start?.dateTime ?? '',
				endIso: cancelledEvent.end?.dateTime ?? '',
				patientName: caller?.name || '',
				patientPhone: caller?.phone || '',
				patientEmail: caller?.email || '',
				notes: '',
				appointmentType: ''
			});

			return { 
				success: true, 
				event: cancelledEvent,
				message: `I've successfully cancelled your appointment. If you need to reschedule, please let me know and I'll be happy to help you find a new time.`
			};

		case 'lookup_appointment':
			const foundEvent = await findEventByPatient({ lookupKey: args.lookupKey, patient: caller });
			if (!foundEvent) {
				return { success: false, message: 'I couldn\'t find any appointments matching that information. Could you please double-check your details?' };
			}
			
			return { 
				success: true, 
				event: foundEvent,
				message: `I found your appointment scheduled for ${new Date(foundEvent.start?.dateTime || '').toLocaleString()}. How can I help you with this appointment?`
			};

		default:
			return { success: false, message: 'I\'m not sure how to help with that request. Could you please clarify what you\'d like to do?' };
	}
}

// Chat endpoint for Retell AI
router.post('/chat', async (req, res) => {
	try {
		const { messages, metadata } = req.body;
		
		// Create system message with caring prompt
		const systemMessage = {
			role: 'system' as const,
			content: createPharmacySystemPrompt()
		};

		// Prepare messages with system prompt
		const chatMessages = [systemMessage, ...messages];

		// Create chat completion request
		const request = {
			messages: chatMessages,
			model: 'gpt-4o-mini',
			tools: RetellChatClient.createPharmacyTools(),
			metadata: {
				...metadata,
				caller: req.body.caller || {}
			}
		};

		// Get response from Retell
		const response = await retellClient.createChatCompletion(request);
		const choice = response.choices[0];
		
		if (!choice) {
			return res.status(500).json({ error: 'No response from Retell AI' });
		}

		// Handle tool calls
		if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
			const toolResults = [];
			
			for (const toolCall of choice.message.tool_calls) {
				try {
					const args = JSON.parse(toolCall.function.arguments);
					const result = await executeTool(toolCall.function.name, args, metadata?.caller);
					
					toolResults.push({
						tool_call_id: toolCall.id,
						role: 'tool' as const,
						content: JSON.stringify(result)
					});
				} catch (error: any) {
					toolResults.push({
						tool_call_id: toolCall.id,
						role: 'tool' as const,
						content: JSON.stringify({ 
							success: false, 
							message: `I encountered an issue: ${error.message}. Please try again or contact our support team.` 
						})
					});
				}
			}

			// Get follow-up response with tool results
			const followUpMessages = [...chatMessages, choice.message, ...toolResults];
			const followUpRequest = {
				messages: followUpMessages,
				model: 'gpt-4o-mini',
				tools: RetellChatClient.createPharmacyTools()
			};

			const followUpResponse = await retellClient.createChatCompletion(followUpRequest);
			const followUpChoice = followUpResponse.choices[0];

			return res.json({
				id: followUpResponse.id,
				message: {
					role: 'assistant',
					content: followUpChoice?.message.content || 'I\'ve processed your request. How else can I help you today?'
				},
				usage: followUpResponse.usage
			});
		}

		// Return regular response
		return res.json({
			id: response.id,
			message: {
				role: 'assistant',
				content: choice.message.content || 'How can I help you with your pharmacy appointment today?'
			},
			usage: response.usage
		});

	} catch (error: any) {
		console.error('Chat error:', error);
		return res.status(500).json({ 
			error: 'Chat service temporarily unavailable',
			message: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment or contact our support team directly.'
		});
	}
});

// Health check for chat service
router.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		service: 'pharmacy-chat',
		timestamp: new Date().toISOString()
	});
});

export default router;
