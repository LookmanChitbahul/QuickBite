# QuickBite Hosting & Production Guide

This guide outlines how to host QuickBite for free during development and for future production use.

## 1. Database & Authentication (Backend)
The app is already configured to use **Firebase**. Firebase offers a generous **Spark Plan (Free)** that is perfect for starting out.

- **Storage/Database**: Use **Firebase Firestore** (NoSQL) for storing restaurant data, orders, and user profiles.
- **Authentication**: Use **Firebase Auth** for Email/Password, Google, and Apple login.
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting) provides a free URL to host the web version of the app.

## 2. Web Hosting (Alternative)
If you want to host the web version of the QuickBite app:
- **Vercel**: Connect your GitHub repository to [Vercel](https://vercel.com/). It will automatically build and deploy your React Native (Web) project every time you push code.
- **Netlify**: Similar to Vercel, [Netlify](https://www.netlify.com/) provides excellent free hosting with continuous deployment.

## 3. Mobile App Distribution (Android/iOS)
Since this is an Expo project, the best way to distribute it is through **Expo Application Services (EAS)**.

- **EAS Build**: You can create `.apk` (Android) and `.ipa` (iOS) files for free (subject to some queue times on the free tier).
- **EAS Update**: This allows you to push small fixes and UI changes directly to the app without having to re-submit to the Play Store/App Store.
- **Expo Go**: For testing in Mauritius, you can simply share the dev link or a "Preview" build via Expo.

## 4. Maps API
- **Google Maps**: You will need a **Google Cloud Platform** account. They provide a $200 monthly credit for free, which is more than enough for several thousand map views per month.

---

# Troubleshooting Expo Go Error
If you are seeing `java.io.IOException: Failed to download remote update`, follow these steps:

1. **Clear Expo Go Cache**:
   - Long press the Expo Go icon on your phone.
   - Go to **App Info** > **Storage & Cache**.
   - Select **Clear Cache** and **Clear Storage**.
2. **Force Local Mode**:
   - Stop your server (`Ctrl+C`).
   - Run: `npx expo start --clear`
   - Ensure your phone and computer are on the **same Wi-Fi network**.
3. **Verify IP Address**:
   - Sometimes the automatically detected IP is wrong. Try running:
     `npx expo start --tunnel`
   - This uses a Ngrok tunnel to bypass network restrictions.
