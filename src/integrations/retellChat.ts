import axios from 'axios';

export interface RetellChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface RetellChatRequest {
	messages: RetellChatMessage[];
	model?: string;
	tools?: RetellTool[];
	metadata?: Record<string, any>;
}

export interface RetellTool {
	name: string;
	description: string;
	parameters: {
		type: 'object';
		properties: Record<string, any>;
		required?: string[];
	};
}

export interface RetellChatResponse {
	id: string;
	object: 'chat.completion';
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: {
			role: 'assistant';
			content: string | null;
			tool_calls?: Array<{
				id: string;
				type: 'function';
				function: {
					name: string;
					arguments: string;
				};
			}>;
		};
		finish_reason: string;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

export class RetellChatClient {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string, baseUrl = 'https://api.retellai.com/v2') {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	async createChatCompletion(request: RetellChatRequest): Promise<RetellChatResponse> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/chat/completions`,
				request,
				{
					headers: {
						'Authorization': `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);
			return response.data;
		} catch (error: any) {
			throw new Error(`Retell API error: ${error.response?.data?.error?.message || error.message}`);
		}
	}

	// Helper method to create tool definitions for our pharmacy appointment system
	static createPharmacyTools(): RetellTool[] {
		return [
			{
				name: 'check_availability',
				description: 'Check available appointment slots for a given date range and appointment type',
				parameters: {
					type: 'object',
					properties: {
						appointmentType: {
							type: 'string',
							description: 'Type of appointment (e.g., "flu shot", "consultation", "vaccination")',
							enum: ['flu_shot', 'consultation', 'vaccination', 'medication_review']
						},
						from: {
							type: 'string',
							description: 'Start date for availability check (ISO 8601 format)',
							format: 'date-time'
						},
						to: {
							type: 'string',
							description: 'End date for availability check (ISO 8601 format)',
							format: 'date-time'
						},
						durationMin: {
							type: 'number',
							description: 'Duration of appointment in minutes',
							default: 20
						}
					},
					required: ['appointmentType']
				}
			},
			{
				name: 'book_appointment',
				description: 'Book a new appointment for a patient',
				parameters: {
					type: 'object',
					properties: {
						appointmentType: {
							type: 'string',
							description: 'Type of appointment',
							enum: ['flu_shot', 'consultation', 'vaccination', 'medication_review']
						},
						slotStartIso: {
							type: 'string',
							description: 'Start time of the appointment slot (ISO 8601 format)',
							format: 'date-time'
						},
						durationMin: {
							type: 'number',
							description: 'Duration of appointment in minutes',
							default: 20
						},
						patientName: {
							type: 'string',
							description: 'Full name of the patient'
						},
						patientPhone: {
							type: 'string',
							description: 'Phone number of the patient'
						},
						patientEmail: {
							type: 'string',
							description: 'Email address of the patient'
						},
						notes: {
							type: 'string',
							description: 'Additional notes or special requirements'
						}
					},
					required: ['appointmentType', 'slotStartIso', 'patientName', 'patientPhone']
				}
			},
			{
				name: 'reschedule_appointment',
				description: 'Reschedule an existing appointment',
				parameters: {
					type: 'object',
					properties: {
						lookupKey: {
							type: 'string',
							description: 'Patient email, phone, or name to find the appointment'
						},
						newStartIso: {
							type: 'string',
							description: 'New start time for the appointment (ISO 8601 format)',
							format: 'date-time'
						},
						durationMin: {
							type: 'number',
							description: 'Duration of appointment in minutes',
							default: 20
						}
					},
					required: ['lookupKey', 'newStartIso']
				}
			},
			{
				name: 'cancel_appointment',
				description: 'Cancel an existing appointment',
				parameters: {
					type: 'object',
					properties: {
						lookupKey: {
							type: 'string',
							description: 'Patient email, phone, or name to find the appointment'
						}
					},
					required: ['lookupKey']
				}
			},
			{
				name: 'lookup_appointment',
				description: 'Look up existing appointments for a patient',
				parameters: {
					type: 'object',
					properties: {
						lookupKey: {
							type: 'string',
							description: 'Patient email, phone, or name to search for'
						}
					},
					required: ['lookupKey']
				}
			}
		];
	}
}

// Helper function to create a caring, respectful system prompt
export function createPharmacySystemPrompt(): string {
	return `You are a caring and professional pharmacy appointment assistant. Your role is to help patients book, reschedule, or cancel appointments with empathy and attention to detail.

Key guidelines:
- Always be warm, respectful, and patient-focused
- Ask clarifying questions when information is unclear
- Confirm all details before booking appointments
- Offer alternative times if the requested slot is unavailable
- Be understanding about cancellations and rescheduling needs
- Use the patient's name when possible to create a personal connection
- Explain any requirements or preparations needed for the appointment

Appointment types available:
- Flu shot: Quick vaccination appointment (15-20 minutes)
- Consultation: Medication review or health consultation (20-30 minutes)
- Vaccination: Other vaccinations beyond flu shot (15-20 minutes)
- Medication review: Comprehensive medication assessment (30 minutes)

When booking appointments:
1. Confirm the appointment type and duration
2. Verify patient contact information (name, phone, email)
3. Check availability for the requested time
4. If unavailable, suggest the next best alternatives
5. Confirm all details before finalizing the booking

Always end conversations by confirming the appointment details and providing any necessary preparation instructions.`;
}
