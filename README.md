# Tic-Tac-Toe Game 🎮

A modern, sleek Tic-Tac-Toe game originally built as a web app with vanilla HTML/CSS/JavaScript and fully ported into a cross-platform mobile application using **React Native (Expo)** ready for Android APK compilation.

---

## ✨ Features

- **🎨 Modern Dark Theme**: Clean, responsive UI with neon accents (#1892EA for X, #A737FF for O).
- **👥 1 Player & 2 Players Modes**:
  - **1 Player Mode (vs Computer)**: Play solo against an AI opponent.
  - **2 Players Mode (Pass & Play)**: Local two-player mode on the same device with real-time turn tracking.
- **🧠 3 Computer Difficulty Levels (AI IQ)**:
  - 🟢 **Easy**: Casual, randomized AI moves.
  - 🟡 **Medium**: Strategic AI that takes winning moves, blocks opponent wins, and controls the center/corners.
  - 🔴 **Hard**: Unbeatable AI powered by the **Minimax Algorithm**.
- **🔄 Interactive Controls**:
  - Choose starting symbol (`X` or `O`).
  - Dynamic game status headers (Player turn, winner, or draw).
  - Highlighted winning line/cells upon victory.
  - Quick restart button.

---

## 📁 Project Structure

```text
TicTacToe/
├── index.html            # Original web game HTML
├── style.css             # Web game styles
├── script.js             # Web game logic
├── README.md             # Project documentation
└── TicTacToeApp/         # React Native (Expo) Mobile App
    ├── App.js            # Core game component with Minimax AI & mode controls
    ├── app.json          # Expo project configuration (Package name: com.tictactoe.game)
    ├── eas.json          # EAS Build configuration for generating Android APK
    ├── package.json      # Project dependencies & scripts
    └── assets/           # App icons, splash screens, and adaptive assets
```

---

## 🚀 Running the Web Version

Simply open [`index.html`](file:///g:/MERN%202505/VSCode/JavaScript/New%20folder/TicTacToe/index.html) in any modern web browser or use VS Code Live Server.

---

## 📱 Running the Mobile App (React Native / Expo)

### 1. Install Dependencies
```bash
cd TicTacToeApp
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```
- Open the **Expo Go** app on your Android device.
- Scan the QR code displayed in the terminal to play and test the app live.

---

## 📦 Building the Android APK

The project is preconfigured with EAS Build so you can generate an Android APK directly in the cloud without needing Android Studio or Java installed locally.

### 1. Log in to Expo (Free Account)
```bash
cd TicTacToeApp
npx eas login
```
*(If you do not have an account, create one at [expo.dev/signup](https://expo.dev/signup)).*

### 2. Trigger the APK Cloud Build
```bash
npx eas build -p android --profile preview
```

### 3. Download & Install
Once the build completes:
1. Copy the download link provided in your terminal or visit your [Expo Dashboard](https://expo.dev).
2. Download the `.apk` file to your Android phone.
3. Open and install the APK on your device!
