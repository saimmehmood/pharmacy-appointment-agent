# Retell AI Setup Guide

## Overview

This guide walks you through setting up your Retell AI agent to work with the pharmacy appointment system. The setup supports both text chat and voice calls with minimal configuration changes.

## Prerequisites

1. **Retell AI Account**: Sign up at [retellai.com](https://retellai.com)
2. **API Key**: Get your Retell API key from the dashboard
3. **Deployed Server**: Your pharmacy appointment server must be accessible via HTTPS

## Step 1: Create Your Agent

### 1.1 Basic Agent Configuration
1. Log into your Retell AI dashboard
2. Click "Create New Agent"
3. Choose "Custom Agent" option
4. Fill in the basic information:
   - **Name**: "Pharmacy Appointment Assistant"
   - **Description**: "Helps patients book, reschedule, and cancel pharmacy appointments"
   - **Language**: English (US)

### 1.2 Voice Settings (Optional)
- **Voice**: Choose a professional, caring voice (e.g., "Sarah" or "David")
- **Speed**: Normal (1.0x)
- **Pitch**: Natural
- **Emotion**: Warm and professional

## Step 2: Configure the Chat API

### 2.1 Chat API Settings
1. In your agent settings, go to "Chat API" section
2. Set the following configuration:

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 1000,
  "system_prompt": "You are a caring and professional pharmacy appointment assistant. Help patients with booking, rescheduling, and canceling appointments with empathy and attention to detail.",
  "tools": [
    {
      "name": "check_availability",
      "description": "Check available appointment slots",
      "parameters": {
        "type": "object",
        "properties": {
          "appointmentType": {
            "type": "string",
            "enum": ["flu_shot", "consultation", "vaccination", "medication_review"]
          },
          "from": {"type": "string", "format": "date-time"},
          "to": {"type": "string", "format": "date-time"},
          "durationMin": {"type": "number", "default": 20}
        },
        "required": ["appointmentType"]
      }
    },
    {
      "name": "book_appointment",
      "description": "Book a new appointment",
      "parameters": {
        "type": "object",
        "properties": {
          "appointmentType": {"type": "string"},
          "slotStartIso": {"type": "string", "format": "date-time"},
          "durationMin": {"type": "number", "default": 20},
          "patientName": {"type": "string"},
          "patientPhone": {"type": "string"},
          "patientEmail": {"type": "string"},
          "notes": {"type": "string"}
        },
        "required": ["appointmentType", "slotStartIso", "patientName", "patientPhone"]
      }
    },
    {
      "name": "reschedule_appointment",
      "description": "Reschedule an existing appointment",
      "parameters": {
        "type": "object",
        "properties": {
          "lookupKey": {"type": "string"},
          "newStartIso": {"type": "string", "format": "date-time"},
          "durationMin": {"type": "number", "default": 20}
        },
        "required": ["lookupKey", "newStartIso"]
      }
    },
    {
      "name": "cancel_appointment",
      "description": "Cancel an existing appointment",
      "parameters": {
        "type": "object",
        "properties": {
          "lookupKey": {"type": "string"}
        },
        "required": ["lookupKey"]
      }
    },
    {
      "name": "lookup_appointment",
      "description": "Look up existing appointments",
      "parameters": {
        "type": "object",
        "properties": {
          "lookupKey": {"type": "string"}
        },
        "required": ["lookupKey"]
      }
    }
  ]
}
```

### 2.2 Webhook Configuration
1. Set your webhook URL to: `https://your-server.com/chat`
2. Enable "Tool Calls" in webhook settings
3. Set timeout to 30 seconds
4. Enable retry on failure

## Step 3: Environment Configuration

### 3.1 Server Environment Variables
Add these to your server's `.env` file:

```bash
# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key_here

# Google API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GSHEET_ID=your-google-sheet-id
GSHEET_TAB=Bookings

# Server Configuration
PORT=3000
SERVER_URL=https://your-server.com
```

### 3.2 Google API Setup
1. Create a Google Cloud Project
2. Enable Calendar and Sheets APIs
3. Create a service account
4. Download the JSON key file
5. Share your calendar and sheet with the service account email

## Step 4: Testing Your Setup

### 4.1 Text Chat Testing
1. Go to your Retell agent dashboard
2. Click "Test Chat"
3. Try these test scenarios:

```
User: "Hi, I need to book a flu shot appointment"
Expected: Agent checks availability and shows options

User: "I'd like to book for tomorrow at 2 PM. My name is John Smith, phone 555-1234"
Expected: Agent books the appointment and confirms

User: "I need to reschedule my appointment. My phone is 555-1234"
Expected: Agent finds existing appointment and helps reschedule
```

### 4.2 Voice Testing
1. Enable voice mode in your agent settings
2. Test with a phone call
3. Verify the voice quality and response time
4. Test tool calling in voice mode

### 4.3 API Testing
Use the provided test script:

```bash
node scripts/test-chat-api.js
```

## Step 5: Production Deployment

### 5.1 Security Considerations
- Use HTTPS for all webhook URLs
- Implement rate limiting
- Monitor API usage
- Set up error alerting

### 5.2 Monitoring
- Set up health checks for your server
- Monitor Retell AI usage and costs
- Track appointment booking success rates
- Monitor Google API quotas

### 5.3 Scaling
- Use connection pooling for Google APIs
- Implement caching for availability checks
- Consider load balancing for high traffic
- Set up auto-scaling if needed

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Calls
- Check webhook URL is accessible
- Verify HTTPS certificate
- Check firewall settings
- Review Retell AI webhook logs

#### 2. Tool Calls Failing
- Verify API keys are correct
- Check Google API quotas
- Review server logs for errors
- Test individual tool endpoints

#### 3. Voice Quality Issues
- Adjust voice settings in Retell dashboard
- Check network latency
- Verify audio codec settings
- Test with different devices

#### 4. Calendar Integration Issues
- Verify calendar sharing permissions
- Check service account permissions
- Review Google API quotas
- Test calendar API directly

### Debug Mode
Enable debug logging in your server:

```bash
DEBUG=true npm start
```

### Support Resources
- [Retell AI Documentation](https://docs.retellai.com)
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [Google Sheets API Docs](https://developers.google.com/sheets)

## Configuration Screenshots

### Agent Settings
![Agent Configuration](screenshots/agent-settings.png)

### Webhook Configuration
![Webhook Setup](screenshots/webhook-config.png)

### Tool Definitions
![Tool Configuration](screenshots/tool-definitions.png)

### Voice Settings
![Voice Configuration](screenshots/voice-settings.png)

## Next Steps

1. **Customize the System Prompt**: Adjust the personality and responses
2. **Add More Appointment Types**: Expand beyond flu shots and consultations
3. **Implement Notifications**: Add SMS or email confirmations
4. **Analytics**: Track usage patterns and success rates
5. **Multi-language**: Add support for other languages
