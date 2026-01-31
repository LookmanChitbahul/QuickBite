# QuickBite Technical Requirements & Implementation Plan

This document outlines the core functionality and technical requirements for the QuickBite app, as discussed. These features are planned for future implementation.

## 1. Core Model: Self-Pickup & Multi-Restaurant
QuickBite is strictly a **self-pickup** platform. There is no delivery component.
- **Unified Cart**: Users can add items from multiple different restaurants (e.g., KFC, McDonald's, and Domino's) into a single order.
- **Order Management**: Each restaurant receives its portion of the order independently.
- **Ready Notifications**: The app will provide a real-time notification (with a countdown timer) when the order is ready for pickup at the respective restaurant(s).

## 2. Location-Based Map Integration
The app relies heavily on the user's physical location.
- **Provider**: Google Maps (Initial implementation), with a possible future migration to Mapbox.
- **Discovery**:
    - By default, the map displays restaurants closest to the user's current location.
    - Users can also browse the map to select a restaurant of their choice.
- **Markers**: Pinpoint icons represent all available restaurants in Mauritius.
- **Information Box**: Tapping a restaurant pin opens an overlay (Info Window) containing:
    - Restaurant name and basic details.
    - A prominent button to launch **Augmented Reality (AR)** mode.

## 3. Restaurant Owner Panel (Revenue & Logs)
To provide transparency and management for restaurant owners.
- **Unified Log**: A detailed, scrollable list of all orders, styled like a banking transaction history.
- **Revenue Tracking**: Real-time updates on total earnings for the selected restaurant.
- **Data Points**: User ID/Name, items ordered, total cost, and time of order.

## 4. UI Design: Profile & Branding
The app's profile section will follow the aesthetic of the **MCB Juice** app.
- **Colors**:
    - **Primary Red**: #CC0000 (Guardsman Red)
    - **Base**: #FFFFFF (White)
    - **Logout Interface**: Specific requirement for the Logout button to be **#FFA500 (Orange)**.
- **Typography & Layout**: Clean, modern, and high-contrast, typical of a financial/banking application.

## 5. Augmented Reality (AR) Feature
A "static" AR experience built using **ViroReact**.
- **Visuals**: Similar to Pokémon GO, it overlays restaurant locations in the real world via the camera view.
- **Focus**: It primarily shows the location of the selected restaurant, but can be toggled to show all restaurants in Mauritius.
- **Navigation**: Includes a "Back" button to return to the map or previous screen.

## 6. Technical Constraints & Prerequisites
- **Location Services**: Must be enabled on the device for the map and discovery features to function.
- **AR Compatibility**: The device must support AR features (ARCore/ARKit) for ViroReact to function correctly.
