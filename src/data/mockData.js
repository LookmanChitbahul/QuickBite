export const restaurants = [
    // --- Ocean Basket Branches ---
    {
        id: 'oceanbasket-bagatelle',
        brand: 'OceanBasket',
        name: "Ocean Basket Bagatelle",
        address: 'Bagatelle Mall, Mauritius',
        city: 'Bagatelle',
        phone: '+230 468 8888',
        location: { latitude: -20.22427, longitude: 57.49660 },
        rating: 4.8,
        reviews: 2150,
        distance: '0.9 km',
        image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?auto=format&fit=crop&w=1350&q=80',
        description: 'Mediterranean style seafood restaurant.',
        bankDetails: { bank: 'Absa', account: '404050506060', name: 'Ocean Basket MU', juice: '52224444' },
        menu: [
            { id: 'o1', name: 'Platter for 2', price: 1850, description: 'Prawns, calamari, mussels and fish', image: 'https://images.unsplash.com/photo-1534080564617-59718db9e925?auto=format&fit=crop&w=800&q=80' },
            { id: 'o2', name: 'Grilled Fish & Chips', price: 520, description: 'Freshly grilled hake with chips', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
            { id: 'o3', name: 'Famous Prawns (12)', price: 650, description: 'Grilled prawns with garlic butter', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' }
        ],
        hours: '12:00 PM - 10:00 PM',
        tags: ['Seafood', 'Family', 'Casual']
    },
    {
        id: 'oceanbasket-phoenix',
        brand: 'OceanBasket',
        name: "Ocean Basket Phoenix",
        address: 'Phoenix Mall, Mauritius',
        city: 'Phoenix',
        phone: '+230 424 9588',
        location: { latitude: -20.278536, longitude: 57.495500 },
        rating: 4.6,
        reviews: 1500,
        distance: '6.5 km',
        image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?auto=format&fit=crop&w=1350&q=80',
        description: 'Seafood at Phoenix Mall.',
        bankDetails: { bank: 'Absa', account: '404050506060', name: 'Ocean Basket MU', juice: '52224444' },
        menu: [
            { id: 'o1', name: 'Platter for 2', price: 1850, description: 'Prawns, calamari, mussels and fish', image: 'https://images.unsplash.com/photo-1534080564617-59718db9e925?auto=format&fit=crop&w=800&q=80' }
        ],
        hours: '12:00 PM - 10:00 PM',
        tags: ['Seafood', 'Family', 'Casual']
    },

    // --- KFC Branches ---
    {
        id: 'kfc-bagatelle',
        brand: 'KFC',
        name: 'KFC Bagatelle',
        address: 'Bagatelle Mall, Moka, Mauritius',
        city: 'Bagatelle',
        phone: '+230 432 1617',
        location: { latitude: -20.22427, longitude: 57.49660 },
        rating: 4.8,
        reviews: 2450,
        distance: '0.8 km',
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Bagatelle Mall.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [
            { id: 'k1', name: '18-Piece Bucket', price: 1450, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1200&q=80' },
            { id: 'k2', name: 'Zinger Box Meal', price: 320, description: 'Zinger burger, 2 wings, chips and drink', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
            { id: 'k3', name: 'Colonel Burger', price: 210, description: 'The original chicken burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
            { id: 'k4', name: 'Hot Wings (6pcs)', price: 180, description: 'Spicy and crunchy chicken wings', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80' },
            { id: 'k5', name: 'Twister', price: 195, description: 'Toasted wrap with spicy strips', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80' }
        ],
        hours: '10:00 AM - 10:00 PM',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: 'kfc-curepipe',
        brand: 'KFC',
        name: 'KFC Curepipe',
        address: 'Curepipe, Mauritius',
        city: 'Curepipe',
        phone: '+230 432 1604',
        location: { latitude: -20.32165, longitude: 57.52648 },
        rating: 4.7,
        reviews: 1800,
        distance: '5.2 km',
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1350&q=80',
        description: 'Finger Lickin Good! Town Center.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [
            { id: 'k1', name: '18-Piece Bucket', price: 1450, description: '18 pieces of original recipe chicken', image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1200&q=80' }
        ],
        hours: '10:00 AM - 10:00 PM',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },

    // --- McDonald's Branches ---
    {
        id: 'mcd-portlouis',
        brand: 'McDonald\'s',
        name: "McDonald's Port Louis",
        address: 'Port Louis, Mauritius',
        city: 'Port Louis',
        phone: '+230 208 3588',
        location: { latitude: -20.16142, longitude: 57.501342 },
        rating: 4.5,
        reviews: 1800,
        distance: '10.5 km',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1350&q=80',
        description: 'Im Lovin It! Waterfront.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [
            { id: 'm1', name: 'Big Mac™', price: 240, description: 'Double beef patty with special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
            { id: 'm2', name: 'McChicken™', price: 190, description: 'Classical chicken sandwich', image: 'https://images.unsplash.com/photo-1610440042657-6dd2c44c5e27?auto=format&fit=crop&w=800&q=80' },
            { id: 'm3', name: 'Nuggets (9pcs)', price: 175, description: 'Golden crispy chicken nuggets', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80' },
            { id: 'm4', name: 'Quarter Pounder', price: 260, description: 'Fresh beef with melted cheese', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?auto=format&fit=crop&w=800&q=80' }
        ],
        hours: '08:00 AM - 11:00 PM',
        tags: ['Burgers', 'Family', 'Halal']
    },

    // --- Domino's Pizza Branches ---
    {
        id: 'dominos-quatrebornes',
        brand: 'Dominos',
        name: "Domino's Pizza Quatre Bornes",
        address: 'Quatre Bornes, Mauritius',
        city: 'Quatre Bornes',
        phone: '+230 460 9197',
        location: { latitude: -20.258802, longitude: 57.489843 },
        rating: 4.4,
        reviews: 1200,
        distance: '2.1 km',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1350&q=80',
        description: 'The best pizza delivery experience.',
        bankDetails: { bank: 'MCB', account: '000998877665', name: 'Dominos Pizza MU', juice: '59993333' },
        menu: [
            { id: 'd1', name: 'Chicken Mayo Pizza', price: 420, description: 'Creamy mayo with grilled chicken', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
            { id: 'd2', name: 'Pepperoni Passion', price: 465, description: 'Double pepperoni and extra cheese', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' }
        ],
        hours: '11:00 AM - 09:00 PM',
        tags: ['Pizza', 'Italian', 'Delivery']
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
