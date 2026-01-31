# QuickBite Project Specification

## Project Vision
QuickBite is an ordering platform focused on **self-pickup**. The app allows users to browse and order from various restaurants (KFC, McDonald's, Domino's, etc.) without the need for a delivery service.

## Core Features & Requirements

### 1. Ordering & Pickup
- **Multi-Restaurant Support**: Users can select items from different restaurants in a single session.
- **Self-Pickup Only**: No delivery functionality. The `deliveryFee` has been removed from the schema.
- **Restaurant Address**: Orders now track the `restaurantAddress` instead of a delivery address.
- **Ready Notifications**: Users get a notification when their order is ready for pickup, including a timer for preparation.

### 2. Map & Selection
- **Google Maps Integration**: Currently using Google Maps (with potential future migration to Mapbox).
- **Restaurant Selection**:
    - Default view shows the closest restaurants based on device phone location.
    - Users can manually select restaurants from the map.
- **Interaction**:
    - Pinpoint icons represent restaurants in Mauritius.
    - Tapping a pin opens a "Little Box" (Info Window) displaying high-level restaurant details.
    - The Info Window contains a button to enter **Augmented Reality (AR)** mode.

### 3. Restaurant Owner Panel
- **Revenue & Logs**: Owners can view their restaurant's revenue.
- **Order Logs**: A real-time transaction log (like a bank statement) showing every order placed by users.
- **Transaction Details**: Each entry shows order items, timestamp, and amount.

### 4. UI & Theme (Profile Screen)
- **Theme Inspiration**: MCB Juice app (Mauritius).
- **Color Palette**: 
    - Primary: Guardsman Red (#CC0000)
    - Secondary: White (#FFFFFF)
    - Accents: Bright Red (#B50000)
- **Logout Button**: Must be **Orange**.

### 5. Augmented Reality (AR)
- **Technology**: ViroReact.
- **Style**: Static AR similar to Pokémon GO.
- **Functionality**:
    - Shows the selected restaurant's location in space.
    - Capable of showing all restaurants in Mauritius as AR markers.
    - Includes a "Back" button to return to the previous screen (Map/Details).

### 6. Technical Constraints
- **Location Services**: Must be enabled on the user's phone for accurate restaurant distance and map pinning.
- **Authentication**: Supports Email/Password, Google Sign-In, and Apple Sign-In.

---
*Reference: Documentation based on User Request - January 27, 2026*
