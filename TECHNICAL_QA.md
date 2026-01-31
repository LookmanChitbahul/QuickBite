# Technical Q&A

## Question
**"How about for the customer and owner part? If there are 2 devices that scanned the QR code which was hosted locally like `npx expo start`, will that work like seeing if an order from a customer gets logged into the owner dashboard as a transaction?"**

## Answer
**Yes, this will work perfectly.**

Here is the detailed explanation of why and how it works:

1.  **Shared Cloud Backend (Firebase)**:
    *   Your application is powered by **Firebase Firestore**, which is a cloud-based real-time database.
    *   It does **not** store data on your local computer or on the device itself (except for temporary caching).
    *   Both the "Customer" device and the "Owner" device connect to the exact same Firebase database in the cloud.

2.  **Role of `npx expo start`**:
    *   The `npx expo start` command (and the QR code) is only responsible for **delivering the app code** to the phones.
    *   Think of it like downloading a webpage. Once the page is downloaded, it talks to the internet (Firebase), not your computer.
    *   As long as both phones have internet access, they are connected to the same system.

3.  **Real-Time Data Sync**:
    *   When **Device A (Customer)** places an order, the app sends a "write" command to the `orders` collection in Firestore.
    *    **Device B (Owner)** has the Owner Dashboard open, which uses a specific Firestore features (like `onSnapshot` or periodic fetching) to "listen" for changes in that same `orders` collection.
    *   User A's order appears on User B's screen almost instantly (usually within milliseconds to seconds).

4.  **Network Requirements**:
    *   **To load the app**: Both phones usually need to be on the same Wi-Fi as your computer (LAN mode) or use a tunnel (`--tunnel`) to download the JavaScript bundle.
    *   **To sync data**: Both phones just need a working internet connection (Wi-Fi or 4G/5G). They do *not* need to be on the same Wi-Fi network as each other for the orders to go through.

### Summary
You can test the full flow with two physical devices right now. Scan the QR code with both, log one in as a user and one as an owner, and watch the magic happen!
