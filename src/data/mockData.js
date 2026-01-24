export const restaurants = [
    {
        id: '1',
        name: 'KFC Mauritius',
        rating: 4.4,
        reviews: 1250,
        distance: '0.8 km',
        location: { latitude: -20.2443, longitude: 57.4882 }, // Bagatelle
        image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Authentic Kentucky Fried Chicken since 1983 in Mauritius.',
        bankDetails: { bank: 'MCB', account: '000123456789', name: 'KFC Mauritius Ltd', juice: '57771111' },
        menu: [
            { id: 'k1', name: '18-Piece Bucket', price: 950, description: '10 large pieces, 4 wings, and 4 drumsticks', image: 'https://images.unsplash.com/photo-1626645275203-44016264a919?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k2', name: 'Zinger Meal', price: 225, description: 'Spicy chicken fillet sandwich with chips and drink', image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'k3', name: 'Colonel Burger', price: 185, description: 'The classic KFC burger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '10:00 AM - 10:00 PM',
        address: 'Bagatelle Mall, Moka',
        tags: ['Chicken', 'Fast Food', 'Halal']
    },
    {
        id: '2',
        name: "McDonald's Mauritius",
        rating: 4.2,
        reviews: 980,
        distance: '1.5 km',
        location: { latitude: -20.2425, longitude: 57.4865 }, // Bagatelle
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Quality ingredients and fast service. 100% Halal certified.',
        bankDetails: { bank: 'SBM', account: '10122334455', name: 'McD Mauritius', juice: '58882222' },
        menu: [
            { id: 'm1', name: 'Big Mac™', price: 185, description: 'Two 100% beef patties with Big Mac sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'm2', name: 'McChicken™', price: 155, description: 'Crispy chicken fillet with mayo and lettuce', image: 'https://images.unsplash.com/photo-1610440042657-6dd2c44c5e27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        ],
        hours: '08:00 AM - 11:00 PM',
        address: 'Riche Terre Mall / Bagatelle',
        tags: ['Burgers', 'Family', 'Halal']
    },
    {
        id: '3',
        name: "Domino's Pizza Mauritius",
        rating: 4.3,
        reviews: 750,
        distance: '2.1 km',
        location: { latitude: -20.2678, longitude: 57.4725 }, // Quatre Bornes
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Fresh hot pizza delivered to your door.',
        bankDetails: { bank: 'MCB', account: '000998877665', name: 'Dominos Pizza MU', juice: '59993333' },
        menu: [
            { id: 'd1', name: 'Chicken Mayo Pizza', price: 325, description: 'Tender chicken pieces with creamy mayo', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'd2', name: 'Stuffed Cheesy Bread', price: 175, description: '8 pieces of cheesy goodness', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        ],
        hours: '11:00 AM - 09:00 PM',
        address: 'Royal Road, Quatre Bornes',
        tags: ['Pizza', 'Italian', 'Delivery']
    },
    {
        id: '4',
        name: "Ocean Basket Bagatelle",
        rating: 4.6,
        reviews: 1500,
        distance: '0.9 km',
        location: { latitude: -20.2440, longitude: 57.4880 },
        image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Mediterranean style seafood at its best.',
        bankDetails: { bank: 'Absa', account: '404050506060', name: 'Ocean Basket MU', juice: '52224444' },
        menu: [
            { id: 'o1', name: 'Platter for 2', price: 1250, description: 'Prawns, calamari, mussels and fish fillet', image: 'https://images.unsplash.com/photo-1534080564617-59718db9e925?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 'o2', name: 'Grilled Fish & Chips', price: 425, description: 'Fresh hake grilled with lemon butter', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '12:00 PM - 10:00 PM',
        address: 'Bagatelle Mall, Moka',
        tags: ['Seafood', 'Family', 'Casual']
    },
    {
        id: '5',
        name: "Sitar Indian Restaurant",
        rating: 4.7,
        reviews: 850,
        distance: '0.8 km',
        location: { latitude: -20.2441, longitude: 57.4881 },
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Authentic North Indian cuisine in the heart of Moka.',
        bankDetails: { bank: 'MCB', account: '000887766554', name: 'Sitar Ltd', juice: '51115555' },
        menu: [
            { id: 's1', name: 'Butter Chicken', price: 450, description: 'Tender chicken in a rich tomato and butter sauce', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b0ae398?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
            { id: 's2', name: 'Naan Bread Basket', price: 150, description: 'Selection of plain, garlic and butter naans', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }
        ],
        hours: '11:30 AM - 10:30 PM',
        address: 'Bagatelle Mall, Moka',
        tags: ['Indian', 'Spicy', 'Curry']
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
