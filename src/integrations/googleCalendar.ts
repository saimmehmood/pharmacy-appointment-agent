import { google } from 'googleapis';
import dayjs from 'dayjs';

type Patient = { name?: string; phone?: string; email?: string };

function getAuth() {
	const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
	if (!clientEmail || !privateKey) throw new Error('Missing Google service account credentials');
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

export async function fetchFreeSlots(params: { from: string; to: string; durationMin: number }) {
	const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
	const calendar = getCalendar();
	const freebusy = await calendar.freebusy.query({
		requestBody: {
			timeMin: params.from,
			timeMax: params.to,
			items: [{ id: calendarId }],
		},
	});
	const busy = freebusy.data.calendars?.[calendarId]?.busy ?? [];
	const slots: { start: string; end: string }[] = [];
	let cursor = dayjs(params.from);
	const end = dayjs(params.to);
	while (cursor.add(params.durationMin, 'minute').isBefore(end) || cursor.add(params.durationMin, 'minute').isSame(end)) {
		const slotStart = cursor;
		const slotEnd = cursor.add(params.durationMin, 'minute');
		const overlaps = busy.some(b => dayjs(b.start).isBefore(slotEnd) && dayjs(b.end).isAfter(slotStart));
		if (!overlaps) slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
		cursor = cursor.add(15, 'minute');
	}
	return slots;
}

export async function createCalendarEvent(params: { appointmentType?: string; slotStartIso: string; durationMin: number; patient: Patient; notes: string }) {
	const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
	const calendar = getCalendar();
	const start = dayjs(params.slotStartIso);
	const end = start.add(params.durationMin, 'minute');
	const summary = `Pharmacy ${params.appointmentType || 'Appointment'} - ${params.patient.name || ''}`.trim();
	const description = `Notes: ${params.notes || ''}\nPatient Phone: ${params.patient.phone || ''}\nPatient Email: ${params.patient.email || ''}`;
	const created = await calendar.events.insert({
		calendarId,
		requestBody: {
			start: { dateTime: start.toISOString() },
			end: { dateTime: end.toISOString() },
			summary,
			description,
			attendees: params.patient.email ? [{ email: params.patient.email, displayName: params.patient.name || '' }] : undefined,
		},
	});
	return created.data;
}

export async function findEventByPatient(params: { lookupKey?: string; patient?: Patient }) {
	const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
	const calendar = getCalendar();
	const q = params.lookupKey || params.patient?.email || params.patient?.phone || params.patient?.name || '';
	const list = await calendar.events.list({ calendarId, q, maxResults: 5, singleEvents: true, orderBy: 'startTime' });
	return list.data.items?.[0];
}

export async function rescheduleEvent(params: { lookupKey?: string; newStartIso: string; durationMin: number; patient?: Patient }) {
	const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
	const calendar = getCalendar();
	const existing = await findEventByPatient({ lookupKey: params.lookupKey || undefined, patient: params.patient || undefined });
	if (!existing?.id) throw new Error('Event not found');
	const start = dayjs(params.newStartIso);
	const end = start.add(params.durationMin, 'minute');
	const updated = await calendar.events.patch({
		calendarId,
		eventId: existing.id,
		requestBody: { start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } },
	});
	return updated.data;
}

export async function cancelEvent(params: { lookupKey?: string; patient?: Patient }) {
	const calendarId = process.env.GOOGLE_CALENDAR_ID as string;
	const calendar = getCalendar();
	const existing = await findEventByPatient({ lookupKey: params.lookupKey || undefined, patient: params.patient || undefined });
	if (!existing?.id) throw new Error('Event not found');
	await calendar.events.delete({ calendarId, eventId: existing.id });
	return existing;
}


