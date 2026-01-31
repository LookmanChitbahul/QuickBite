export const restaurants = [
    // --- KFC Branches ---
    {
        id: 'kfc-bagatelle',
        brand: 'KFC',
        name: 'KFC Bagatelle',
        rating: 4.8,
        reviews: 2450,
        distance: '0.8 km',
        location: { latitude: -20.2250, longitude: 57.4960 },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Bagatelle Mall.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [
            { id: 'k1', name: '18-Piece Bucket', price: 950, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k2', name: 'Zinger Box Meal', price: 275, description: 'Zinger burger, 2 wings, chips and drink', image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k3', name: 'Colonel Burger', price: 185, description: 'The original chicken burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k4', name: 'Hot Wings (6pcs)', price: 155, description: 'Spicy and crunchy chicken wings', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k5', name: 'Twister', price: 165, description: 'Toasted wrap with spicy strips', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '10:00 AM - 10:00 PM',
        address: 'Bagatelle Mall, Moka',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: 'kfc-curepipe',
        brand: 'KFC',
        name: 'KFC Curepipe',
        rating: 4.7,
        reviews: 1800,
        distance: '5.2 km',
        location: { latitude: -20.3188, longitude: 57.5255 },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Town Center.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [
            { id: 'k1', name: '18-Piece Bucket', price: 950, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '10:00 AM - 10:00 PM',
        address: 'Royal Road, Curepipe',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: 'kfc-portlouis',
        brand: 'KFC',
        name: 'KFC Port Louis',
        rating: 4.6,
        reviews: 2200,
        distance: '10.5 km',
        location: { latitude: -20.1609, longitude: 57.5020 },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Desforges Street.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [{ id: 'k1', name: '18-Piece Bucket', price: 950, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '10:00 AM - 10:00 PM',
        address: 'Desforges St, Port Louis',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: 'kfc-grandbaie',
        brand: 'KFC',
        name: 'KFC Grand Baie',
        rating: 4.9,
        reviews: 3000,
        distance: '25 km',
        location: { latitude: -20.0102, longitude: 57.5855 },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! La Croisette.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [{ id: 'k1', name: '18-Piece Bucket', price: 950, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '10:00 AM - 11:00 PM',
        address: 'La Croisette, Grand Baie',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: 'kfc-flicenflac',
        brand: 'KFC',
        name: 'KFC Flic en Flac',
        rating: 4.7,
        reviews: 1500,
        distance: '18 km',
        location: { latitude: -20.2807, longitude: 57.3630 },
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Coastal Road.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [{ id: 'k1', name: '18-Piece Bucket', price: 950, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '10:00 AM - 11:00 PM',
        address: 'Coastal Road, Flic en Flac',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },

    // --- McDonald's Branches ---
    {
        id: 'mcd-portlouis',
        brand: 'McDonald\'s',
        name: "McDonald's Port Louis",
        rating: 4.5,
        reviews: 1800,
        distance: '10.5 km',
        location: { latitude: -20.1620, longitude: 57.5000 }, // Slightly different from KFC PL
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Im Lovin It! Waterfront.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [
            { id: 'm1', name: 'Big Mac™', price: 195, description: 'Double beef patty with special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'm2', name: 'McChicken™', price: 165, description: 'Classical chicken sandwich', image: 'https://images.unsplash.com/photo-1610440042657-6dd2c44c5e27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'm3', name: 'Nuggets (9pcs)', price: 145, description: 'Golden crispy chicken nuggets', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'm4', name: 'Quarter Pounder', price: 215, description: 'Fresh beef with melted cheese', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '08:00 AM - 11:00 PM',
        address: 'Waterfront, Port Louis',
        tags: ['Burgers', 'Family', 'Halal']
    },
    {
        id: 'mcd-phoenix',
        brand: 'McDonald\'s',
        name: "McDonald's Phoenix",
        rating: 4.4,
        reviews: 1600,
        distance: '6.5 km',
        location: { latitude: -20.2995, longitude: 57.4789 },
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Im Lovin It! Phoenix Mall.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [{ id: 'm1', name: 'Big Mac™', price: 195, description: 'Double beef patty with special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '08:00 AM - 10:00 PM',
        address: 'Phoenix Mall, Phoenix',
        tags: ['Burgers', 'Family', 'Halal']
    },
    {
        id: 'mcd-grandbaie',
        brand: 'McDonald\'s',
        name: "McDonald's Grand Baie",
        rating: 4.6,
        reviews: 2100,
        distance: '25 km',
        location: { latitude: -20.0094, longitude: 57.5759 },
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Im Lovin It! Grand Baie.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [{ id: 'm1', name: 'Big Mac™', price: 195, description: 'Double beef patty with special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '08:00 AM - 11:30 PM',
        address: 'Grand Baie Coeur de Ville',
        tags: ['Burgers', 'Family', 'Halal']
    },
    {
        id: 'mcd-richeterre',
        brand: 'McDonald\'s',
        name: "McDonald's Riche Terre",
        rating: 4.3,
        reviews: 1400,
        distance: '8 km',
        location: { latitude: -20.1264, longitude: 57.5312 },
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Im Lovin It! Riche Terre Mall.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [{ id: 'm1', name: 'Big Mac™', price: 195, description: 'Double beef patty with special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '09:00 AM - 10:00 PM',
        address: 'Riche Terre Mall',
        tags: ['Burgers', 'Family', 'Halal']
    },

    // --- Domino's Pizza Branches ---
    {
        id: 'dominos-quatrebornes',
        brand: 'Dominos',
        name: "Domino's Quatre Bornes",
        rating: 4.4,
        reviews: 1200,
        distance: '2.1 km',
        location: { latitude: -20.2678, longitude: 57.4725 },
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'The best pizza delivery experience.',
        bankDetails: { bank: 'MCB', account: '000998877665', name: 'Dominos Pizza MU', juice: '59993333' },
        menu: [
            { id: 'd1', name: 'Chicken Mayo Pizza', price: 345, description: 'Creamy mayo with grilled chicken', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'd2', name: 'Pepperoni Passion', price: 385, description: 'Double pepperoni and extra cheese', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'd3', name: 'Stuffed Cheesy Bread', price: 175, description: '8 pieces of filled cheesy bread', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'd4', name: 'Veggie Supreme', price: 315, description: 'Mushrooms, peppers, and onions', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '11:00 AM - 09:00 PM',
        address: 'Royal Road, Quatre Bornes',
        tags: ['Pizza', 'Italian', 'Delivery']
    },
    {
        id: 'dominos-portlouis',
        brand: 'Dominos',
        name: "Domino's Port Louis",
        rating: 4.3,
        reviews: 1000,
        distance: '11 km',
        location: { latitude: -20.1600, longitude: 57.4980 },
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Hot Pizza in the City.',
        bankDetails: { bank: 'MCB', account: '000998877665', name: 'Dominos Pizza MU', juice: '59993333' },
        menu: [{ id: 'd1', name: 'Chicken Mayo Pizza', price: 345, description: 'Creamy mayo with grilled chicken', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '11:00 AM - 09:00 PM',
        address: 'Edith Cavell St, Port Louis',
        tags: ['Pizza', 'Italian', 'Delivery']
    },
    {
        id: 'dominos-curepipe',
        brand: 'Dominos',
        name: "Domino's Curepipe",
        rating: 4.5,
        reviews: 900,
        distance: '5.5 km',
        location: { latitude: -20.3180, longitude: 57.5240 },
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Fresh Pizza Curepipe.',
        bankDetails: { bank: 'MCB', account: '000998877665', name: 'Dominos Pizza MU', juice: '59993333' },
        menu: [{ id: 'd1', name: 'Chicken Mayo Pizza', price: 345, description: 'Creamy mayo with grilled chicken', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '11:00 AM - 09:30 PM',
        address: 'Royal Road, Curepipe',
        tags: ['Pizza', 'Italian', 'Delivery']
    },

    // --- Ocean Basket Branches ---
    {
        id: 'oceanbasket-bagatelle',
        brand: 'OceanBasket',
        name: "Ocean Basket Bagatelle",
        rating: 4.7,
        reviews: 2100,
        distance: '0.9 km',
        location: { latitude: -20.2241, longitude: 57.4947 },
        image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Mediterranean style seafood restaurant.',
        bankDetails: { bank: 'Absa', account: '404050506060', name: 'Ocean Basket MU', juice: '52224444' },
        menu: [
            { id: 'o1', name: 'Platter for 2', price: 1250, description: 'Prawns, calamari, mussels and fish', image: 'https://images.unsplash.com/photo-1534080564617-59718db9e925?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'o2', name: 'Grilled Fish & Chips', price: 425, description: 'Freshly grilled hake with chips', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'o3', name: 'Famous Prawns (12)', price: 495, description: 'Grilled prawns with garlic butter', image: 'https://images.unsplash.com/photo-1559135031-61580983196f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '12:00 PM - 10:00 PM',
        address: 'Bagatelle Mall, Moka',
        tags: ['Seafood', 'Family', 'Casual']
    },
    {
        id: 'oceanbasket-phoenix',
        brand: 'OceanBasket',
        name: "Ocean Basket Phoenix",
        rating: 4.6,
        reviews: 1500,
        distance: '6.5 km',
        location: { latitude: -20.2980, longitude: 57.4790 },
        image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Seafood at Phoenix Mall.',
        bankDetails: { bank: 'Absa', account: '404050506060', name: 'Ocean Basket MU', juice: '52224444' },
        menu: [{ id: 'o1', name: 'Platter for 2', price: 1250, description: 'Prawns, calamari, mussels and fish', image: 'https://images.unsplash.com/photo-1534080564617-59718db9e925?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }],
        hours: '12:00 PM - 10:00 PM',
        address: 'Phoenix Mall, Phoenix',
        tags: ['Seafood', 'Family', 'Casual']
    }
];

export const userProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    favorites: ['1'],
    phone: '+230 5555 1234',
    isOwner: false
};

export const ownerProfile = {
    name: 'Chef Mario',
    email: 'mario@example.com',
    isOwner: true,
    restaurantId: '2'
};
