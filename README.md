# Guess Up (guesse up)

[![Flutter](https://img.shields.io/badge/Built%20with-Flutter-blue.svg)](https://flutter.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

**Act, Hint, Laugh!**

Guess Up is a mobile-based charades party game, designed especially for Indian youths and audiences. Put your phone on your forehead and guess the word based on your friends' clues!

## ✨ Features

- **Exciting Gameplay:** Guess words based on clues given by friends.
- **Tilt Controls:** Tilt down for correct answers, tilt up to pass.
- **Customizable Games:** Choose categories and set the timer duration (45s, 60s, 90s, 120s).
- **Firebase Integration:** Fetches categories and words from Cloud Firestore.
- **Offline Mode:** Play using locally stored words or words added in settings.
- **Custom Words:** Add your own words and phrases in the settings screen.
- **Theme Options:** Choose between Light, Dark, and System theme modes.
- **Sound Effects:** Audio cues for game start, correct answers, passes, and timer ending.
- **Cross-Platform:** Built with Flutter for Android and iOS (and potentially other platforms).

## 🚀 Getting Started

This project is a Flutter application.

1.  **Prerequisites:**

    - Ensure you have Flutter installed: [https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)
    - A configured IDE (like VS Code or Android Studio) with Flutter/Dart plugins.
    - An emulator or physical device to run the app.
    - Firebase Project Setup:
      - Create a Firebase project.
      - Set up Cloud Firestore.
      - Add an Android and/or iOS app to your Firebase project.
      - Download `google-services.json` and place it in `android/app/`.
      - (For iOS) Download `GoogleService-Info.plist` and add it to your project via Xcode.
      - Enable Firestore database access.
      - Populate your Firestore 'categories' collection with documents containing 'name' (String), 'icon' (String - Emoji), and 'words' (Array of Strings) fields.

2.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd guess_up
    ```

3.  **Install Dependencies:**

    ```bash
    flutter pub get
    ```

4.  **Run the App:**
    ```bash
    flutter run
    ```

## 🎮 How to Play

1.  Launch the app.
2.  Tap the large Play button.
3.  Select categories you want to play with.
4.  Choose the time limit for each round.
5.  Tap "Start Guessing!".
6.  Place the phone flat, then put it on your forehead.
7.  After the countdown, guess the word based on your friends' clues.
8.  Tilt down 👇 for correct answers.
9.  Tilt up 👆 to pass.
10. Have fun until the timer runs out!

## 🔧 Project Structure

- `lib/`: Contains the core Dart code.
  - `main.dart`: App entry point.
  - `models/`: Data models (e.g., `Category`).
  - `screens/`: UI screens (Home, Game, Config, Result, Settings, etc.).
  - `services/`: Business logic and data handling (Audio, Category, Storage, Theme).
  - `theme/`: App theme definition.
  - `widgets/`: Reusable custom widgets (e.g., `TiltDetector`).
- `assets/`: Images, sounds, and local data files.
- `android/`, `ios/`, `web/`, `linux/`, `macos/`, `windows/`: Platform-specific code.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
