# SobAi - AI-Powered Health & Fitness App

SobAi is a React Native mobile application that leverages AI to provide personalized health and fitness recommendations.

## Features

- AI-powered health insights
- Personalized fitness recommendations
- User authentication and profile management
- Integration with health data sources
- Cross-platform support (iOS & Android)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mrposada/SobAi.git
cd SobAi
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
APPWRITE_ENDPOINT=your_appwrite_endpoint
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
```

## Running the App

### Development
```bash
npm start
# or
yarn start
```

### iOS
```bash
npm run ios
# or
yarn ios
```

### Android
```bash
npm run android
# or
yarn android
```

## Project Structure

```
SobAi/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── services/       # API and service integrations
│   ├── navigation/     # Navigation configuration
│   ├── constants/      # App constants
│   └── utils/          # Utility functions
├── ios/               # iOS native code
├── android/           # Android native code
└── assets/            # Images, fonts, etc.
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native
- Expo
- Appwrite
- OpenAI 