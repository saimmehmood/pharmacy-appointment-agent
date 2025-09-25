import dayjs from 'dayjs';
import { fetchFreeSlots } from '../integrations/googleCalendar.js';

type AvailabilityParams = { appointmentType?: string; from?: string; to?: string; durationMin?: number };

const DEFAULTS: Required<Omit<AvailabilityParams, 'appointmentType'>> = {
	from: dayjs().startOf('day').toISOString(),
	to: dayjs().add(14, 'day').endOf('day').toISOString(),
	durationMin: 20,
};

export async function getAvailability(params: AvailabilityParams) {
	const from = params.from || DEFAULTS.from;
	const to = params.to || DEFAULTS.to;
	const durationMin = params.durationMin || DEFAULTS.durationMin;
	const slots = await fetchFreeSlots({ from, to, durationMin });
	return slots;
}


