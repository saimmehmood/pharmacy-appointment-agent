# Pharmacy Appointment Agent - Technical Architecture

## Overview

This is a voice-ready pharmacy appointment booking system built on Retell AI's chat API. The system can seamlessly transition from text chat to voice calls with minimal configuration changes, providing a caring and professional appointment booking experience.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Retell AI     │    │   Our Server     │    │  Google APIs    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Chat API    │◄┼────┼►│ Chat Router  │ │    │ │ Calendar    │ │
│ │ (Text/Voice)│ │    │ │              │ │    │ │ API         │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │        │         │    │        ▲        │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │        │        │
│ │ Tool Calls  │◄┼────┼►│ Tool Router  │ │    │ ┌─────────────┐ │
│ │             │ │    │ │              │ │    │ │ Sheets API  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Components

### 1. Retell AI Integration (`src/integrations/retellChat.ts`)
- **Purpose**: Handles communication with Retell AI's chat API
- **Key Features**:
  - Tool definition for appointment operations
  - Caring system prompt for empathetic interactions
  - Error handling for API failures
  - Support for both text and voice modes

### 2. Chat Router (`src/routes/chat.ts`)
- **Purpose**: Processes chat messages and executes tool calls
- **Key Features**:
  - Natural language processing for appointment requests
  - Tool execution with proper error handling
  - Caring, respectful responses
  - Integration with calendar and logging systems

### 3. Google Calendar Integration (`src/integrations/googleCalendar.ts`)
- **Purpose**: Manages appointment scheduling
- **Key Features**:
  - Free/busy slot detection
  - Event creation, updating, and cancellation
  - Patient lookup by contact information
  - Timezone-aware scheduling

### 4. Google Sheets Integration (`src/integrations/googleSheets.ts`)
- **Purpose**: Logs all appointment activities
- **Key Features**:
  - Comprehensive booking logs
  - Reschedule and cancellation tracking
  - Patient information storage
  - Audit trail for compliance

### 5. Tool Router (`src/routes/retell.ts`)
- **Purpose**: Direct tool calling interface for Retell AI
- **Key Features**:
  - RESTful API for tool execution
  - Input validation with Zod schemas
  - Error handling and logging
  - Support for all appointment operations

## Data Flow

### Booking Flow
1. User sends message via Retell AI (text or voice)
2. Retell AI processes natural language and calls appropriate tools
3. Our server executes tool calls (check availability, book appointment)
4. Google Calendar creates the event
5. Google Sheets logs the booking
6. Confirmation sent back through Retell AI

### Reschedule Flow
1. User requests reschedule via Retell AI
2. System looks up existing appointment
3. Checks new time availability
4. Updates Google Calendar event
5. Logs reschedule in Google Sheets
6. Confirms new time with user

## Error Handling Strategy

### 1. API Failures
- **Google Calendar API**: Graceful degradation with apology messages
- **Google Sheets API**: Non-blocking logging (appointment still succeeds)
- **Retell AI API**: Retry logic with fallback responses

### 2. User Input Validation
- **Missing Information**: Ask clarifying questions
- **Invalid Times**: Suggest alternative slots
- **Duplicate Bookings**: Prevent double-booking

### 3. Edge Cases
- **No Available Slots**: Suggest next best times
- **Past Dates**: Reject with helpful message
- **Weekend Requests**: Suggest weekday alternatives

## Voice-Ready Design

### Text-to-Voice Transition
The system is designed to work identically in both text and voice modes:

1. **Same API Endpoints**: Both modes use identical chat endpoints
2. **Natural Language**: Responses are optimized for speech
3. **Tool Calls**: Work seamlessly in both modes
4. **Error Handling**: Provides clear audio feedback

### Voice-Specific Considerations
- **Response Length**: Kept concise for better voice experience
- **Confirmation Patterns**: Clear yes/no confirmations
- **Number Formatting**: Spoken-friendly time and date formats
- **Pause Handling**: Graceful handling of speech pauses

## Security & Privacy

### 1. Authentication
- **Google Service Account**: Secure API access
- **Retell API Key**: Encrypted environment variables
- **Input Validation**: Zod schema validation

### 2. Data Protection
- **Patient Information**: Stored securely in Google Sheets
- **Calendar Events**: Private calendar with controlled access
- **API Keys**: Environment variable protection

### 3. Compliance
- **Audit Trail**: Complete logging of all actions
- **Data Retention**: Configurable retention policies
- **Access Control**: Service account permissions

## Scalability Considerations

### 1. Performance
- **Connection Pooling**: Efficient Google API usage
- **Caching**: Calendar availability caching
- **Rate Limiting**: Respect API limits

### 2. Monitoring
- **Health Checks**: Built-in endpoint monitoring
- **Error Logging**: Comprehensive error tracking
- **Usage Metrics**: API call monitoring

### 3. Deployment
- **Container Ready**: Docker support
- **Environment Config**: Flexible configuration
- **Cloud Native**: Ready for cloud deployment

## Testing Strategy

### 1. Unit Tests
- Individual component testing
- Mock external API calls
- Edge case validation

### 2. Integration Tests
- End-to-end booking flows
- API integration testing
- Error scenario testing

### 3. User Testing
- Chat interface testing
- Voice quality testing
- User experience validation

## Future Enhancements

### 1. Advanced Features
- **SMS Notifications**: Appointment reminders
- **Email Confirmations**: Detailed appointment info
- **Multi-language Support**: Internationalization
- **Analytics Dashboard**: Usage insights

### 2. Integration Expansions
- **EMR Systems**: Electronic medical records
- **Payment Processing**: Online payments
- **Insurance Verification**: Coverage checking
- **Telehealth Integration**: Virtual appointments

### 3. AI Improvements
- **Sentiment Analysis**: Emotion detection
- **Predictive Scheduling**: Optimal time suggestions
- **Natural Language**: More conversational AI
- **Multi-modal**: Text, voice, and visual support
