import { google } from 'googleapis';

type LogKind = 'book' | 'reschedule' | 'cancel';

function getSheets() {
	const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
	if (!clientEmail || !privateKey) throw new Error('Missing Google service account credentials');
	const auth = new google.auth.JWT({
		email: clientEmail,
		key: privateKey,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	});
	return google.sheets({ version: 'v4', auth });
}

export async function logBooking(params: { kind: LogKind; eventId: string; startIso: string; endIso: string; patientName: string; patientPhone: string; patientEmail: string; notes: string; appointmentType: string }) {
	const spreadsheetId = process.env.GSHEET_ID as string;
	const sheetName = process.env.GSHEET_TAB || 'Bookings';
	const sheets = getSheets();
	const values = [[
		new Date().toISOString(),
		params.kind,
		params.eventId,
		params.startIso,
		params.endIso,
		params.patientName,
		params.patientPhone,
		params.patientEmail,
		params.appointmentType,
		params.notes,
	]];
	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${sheetName}!A:Z`,
		valueInputOption: 'RAW',
		requestBody: { values },
	});
}


