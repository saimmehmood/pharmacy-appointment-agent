# 🏥 Pharmacy Appointment Agent

A **voice-ready** conversation agent built on Retell AI that handles pharmacy appointment booking, rescheduling, and cancellation with natural language processing. Seamlessly transitions from text chat to voice calls with minimal configuration changes.

## ✨ Features

### 🎯 **Core Functionality**
- **Natural Language Booking**: "I need a flu shot tomorrow at 2 PM"
- **Smart Availability**: Real-time calendar integration with intelligent slot suggestions
- **Patient Management**: Name, phone, email collection with validation
- **Reschedule & Cancel**: Easy appointment modifications
- **Comprehensive Logging**: All actions tracked in Google Sheets

### 🎙️ **Voice-Ready Design**
- **Text-to-Voice Seamless**: Same API works for both chat and voice
- **Caring Personality**: Warm, professional, empathetic responses
- **Natural Conversations**: Handles interruptions, clarifications, and edge cases
- **Audio-Optimized**: Responses designed for speech clarity

### 🔧 **Technical Excellence**
- **Google Calendar Integration**: Real-time availability and booking
- **Google Sheets Logging**: Complete audit trail
- **Error Handling**: Graceful degradation with helpful messages
- **TypeScript**: Full type safety and modern development
- **Production Ready**: Health checks, monitoring, and scaling considerations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud Project with Calendar & Sheets APIs
- Retell AI account
- HTTPS server (for production)

### 1. Installation
```bash
git clone <repository-url>
cd pharmacy_appointment_agent
npm install
```

### 2. Configuration
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Demo Calendar
```bash
npm run setup-demo
```

### 4. Start Server
```bash
npm run dev    # Development
npm run build  # Production build
npm start      # Production server
```

### 5. Test the System
```bash
npm test       # Run API tests
```

## 📋 Environment Setup

### Google API Configuration
```bash
# Google Service Account (from Google Cloud Console)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Calendar & Sheets
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GSHEET_ID=your-google-sheet-id
GSHEET_TAB=Bookings
```

### Retell AI Configuration
```bash
# Get from Retell AI Dashboard
RETELL_API_KEY=your_retell_api_key_here
```

## 🎯 API Endpoints

### Chat API (Primary Interface)
```http
POST /chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "I need to book a flu shot appointment"
    }
  ],
  "metadata": {
    "caller": {
      "name": "John Smith",
      "phone": "555-1234",
      "email": "john@example.com"
    }
  }
}
```

### Tool API (Direct Integration)
```http
POST /retell/tools
Content-Type: application/json

{
  "action": "check_availability|book|reschedule|cancel|lookup",
  "data": { ... },
  "caller": { "name": "", "phone": "", "email": "" }
}
```

## 🎙️ Retell AI Setup

### 1. Create Agent
- Go to [Retell AI Dashboard](https://retellai.com)
- Create new "Custom Agent"
- Name: "Pharmacy Appointment Assistant"

### 2. Configure Chat API
- Set webhook URL: `https://your-server.com/chat`
- Enable tool calls
- Use the provided tool definitions

### 3. Voice Settings (Optional)
- Choose professional voice (e.g., "Sarah" or "David")
- Set speed to normal (1.0x)
- Enable emotion detection

### 4. Test Both Modes
- **Text Chat**: Test in dashboard
- **Voice**: Make test call

## 📊 Demo Calendar

The system includes a realistic demo calendar with:
- **Busy Slots**: Pre-filled appointments across 5 business days
- **Free Slots**: Available times for testing bookings
- **Realistic Scenarios**: Various appointment types and durations

Run `npm run setup-demo` to populate your calendar.

## 🧪 Testing

### Automated Tests
```bash
npm test                    # Full API test suite
npm run test:api           # Chat API tests only
```

### Manual Testing Scenarios
1. **Book Appointment**: "I need a flu shot tomorrow at 2 PM"
2. **Check Availability**: "What times are available this week?"
3. **Reschedule**: "I need to move my appointment to 3 PM"
4. **Cancel**: "I need to cancel my appointment"
5. **Complex Booking**: "I need a consultation with medication review"

## 🏗️ Architecture

### System Components
- **Retell AI**: Natural language processing and voice handling
- **Chat Router**: Message processing and tool execution
- **Google Calendar**: Appointment scheduling and availability
- **Google Sheets**: Comprehensive logging and audit trail
- **Tool Router**: Direct API integration for external systems

### Data Flow
1. User sends message (text/voice) → Retell AI
2. Retell AI processes → Calls appropriate tools
3. Our server executes → Google Calendar/Sheets APIs
4. Results returned → Confirmation to user

## 🔧 Error Handling

### Graceful Degradation
- **API Failures**: Apologetic messages with human handoff offers
- **Missing Info**: Clarifying questions and validation
- **Unavailable Slots**: Alternative time suggestions
- **Invalid Input**: Helpful error messages and guidance

### Monitoring
- Health check endpoints: `/health` and `/chat/health`
- Comprehensive error logging
- API usage tracking
- Performance metrics

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)**: Technical deep dive
- **[Retell Setup](docs/RETELL_SETUP.md)**: Complete configuration guide
- **[Sequence Diagrams](docs/SEQUENCE_DIAGRAM.md)**: Data flow visualization

## 🚀 Production Deployment

### Security
- HTTPS required for webhooks
- Environment variable protection
- Service account permissions
- Rate limiting and monitoring

### Scaling
- Connection pooling for Google APIs
- Caching for availability checks
- Load balancing for high traffic
- Auto-scaling considerations

## 🎯 Voice-Ready Benefits

### Seamless Transition
- **Same Codebase**: Identical logic for text and voice
- **Natural Responses**: Optimized for speech clarity
- **Tool Integration**: Works identically in both modes
- **Error Handling**: Audio-friendly error messages

### Voice-Specific Features
- **Confirmation Patterns**: Clear yes/no responses
- **Number Formatting**: Spoken-friendly time formats
- **Pause Handling**: Graceful speech interruption handling
- **Emotion Detection**: Caring, empathetic responses

## 🔮 Future Enhancements

### Planned Features
- **SMS Notifications**: Appointment reminders
- **Email Confirmations**: Detailed appointment info
- **Multi-language Support**: Internationalization
- **Analytics Dashboard**: Usage insights and metrics

### Integration Expansions
- **EMR Systems**: Electronic medical records
- **Payment Processing**: Online payment integration
- **Insurance Verification**: Coverage checking
- **Telehealth**: Virtual appointment support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions


