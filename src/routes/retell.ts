import express from 'express';
import { z } from 'zod';
import { getAvailability } from '../utils/availability.js';
import { createCalendarEvent, findEventByPatient, rescheduleEvent, cancelEvent } from '../integrations/googleCalendar.js';
import { logBooking } from '../integrations/googleSheets.js';

const router = express.Router();

// Schema for tool invocations from Retell
const toolSchema = z.object({
	action: z.enum(['check_availability', 'book', 'reschedule', 'cancel', 'lookup']),
	data: z.record(z.string(), z.any()).optional(),
	conversationId: z.string().optional(),
	caller: z.object({ name: z.string().optional(), phone: z.string().optional(), email: z.string().optional() }).optional(),
});

router.post('/tools', async (req, res) => {
	const parse = toolSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
	}
	const { action, data, caller } = parse.data;
	try {
		if (action === 'check_availability') {
			const { appointmentType, from, to, durationMin } = data ?? {};
			const slots = await getAvailability({ 
				appointmentType: appointmentType as string | undefined, 
				from: from as string | undefined, 
				to: to as string | undefined, 
				durationMin: durationMin as number | undefined 
			});
			return res.json({ slots });
		}
		if (action === 'book') {
			const { appointmentType, slotStartIso, durationMin, notes } = data ?? {};
			if (!caller || !(caller.name && (caller.phone || caller.email))) {
				return res.status(400).json({ error: 'Missing caller identification (name + phone/email)' });
			}
			const event = await createCalendarEvent({
				appointmentType: appointmentType as string | undefined,
				slotStartIso: slotStartIso as string,
				durationMin: durationMin as number,
				patient: caller as { name?: string; phone?: string; email?: string },
				notes: (notes as string) || '',
			});
			await logBooking({
				kind: 'book',
				eventId: event.id || '',
				startIso: event.start?.dateTime ?? '',
				endIso: event.end?.dateTime ?? '',
				patientName: caller.name ?? '',
				patientPhone: caller.phone ?? '',
				patientEmail: caller.email ?? '',
				notes: (notes as string) || '',
				appointmentType: (appointmentType as string) || '',
			});
			return res.json({ success: true, event });
		}
		if (action === 'reschedule') {
			const { lookupKey, newStartIso, durationMin } = data ?? {};
			const event = await rescheduleEvent({ 
				lookupKey: lookupKey as string | undefined, 
				newStartIso: newStartIso as string, 
				durationMin: durationMin as number, 
				patient: caller || undefined 
			});
			await logBooking({ 
				kind: 'reschedule', 
				eventId: event.id || '', 
				startIso: event.start?.dateTime ?? '', 
				endIso: event.end?.dateTime ?? '', 
				patientName: caller?.name ?? '', 
				patientPhone: caller?.phone ?? '', 
				patientEmail: caller?.email ?? '', 
				notes: '', 
				appointmentType: '' 
			});
			return res.json({ success: true, event });
		}
		if (action === 'cancel') {
			const { lookupKey } = data ?? {};
			const event = await cancelEvent({ 
				lookupKey: lookupKey as string | undefined, 
				patient: caller || undefined 
			});
			await logBooking({ 
				kind: 'cancel', 
				eventId: event.id || '', 
				startIso: event.start?.dateTime ?? '', 
				endIso: event.end?.dateTime ?? '', 
				patientName: caller?.name ?? '', 
				patientPhone: caller?.phone ?? '', 
				patientEmail: caller?.email ?? '', 
				notes: '', 
				appointmentType: '' 
			});
			return res.json({ success: true, event });
		}
		if (action === 'lookup') {
			const { lookupKey } = data ?? {};
			const event = await findEventByPatient({ 
				lookupKey: lookupKey as string | undefined, 
				patient: caller || undefined 
			});
			return res.json({ event });
		}
		return res.status(400).json({ error: 'Unsupported action' });
	} catch (err: any) {
		return res.status(502).json({ error: 'Upstream failure', message: err?.message || 'Unknown error' });
	}
});

export default router;


