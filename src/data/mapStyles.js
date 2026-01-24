export const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
    { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export const deuteranopiaMapStyle = [
    { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "color": "#f0f0f0" }] },
    { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#d0d0d0" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#009E73" }] }, // Bluish-green instead of green
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#0072B2" }] }, // Blue instead of yellow/red
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#56B4E9" }] } // Sky blue
];

export const protanopiaMapStyle = [
    { "featureType": "landscape", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "poi.park", "stylers": [{ "color": "#009E73" }] },
    { "featureType": "road.highway", "stylers": [{ "color": "#56B4E9" }] }, // Sky blue for visibility
    { "featureType": "water", "stylers": [{ "color": "#0072B2" }] } // Deep blue
];

export const tritanopiaMapStyle = [
    { "featureType": "landscape", "stylers": [{ "color": "#f0f0f0" }] },
    { "featureType": "poi.park", "stylers": [{ "color": "#E69F00" }] }, // Orange instead of green/blue
    { "featureType": "road.highway", "stylers": [{ "color": "#D55E00" }] }, // Vermillion for roads
    { "featureType": "water", "stylers": [{ "color": "#000000" }] } // Black/Dark for high contrast against blue-blindness
];
