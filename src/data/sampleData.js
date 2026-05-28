const products = [
  {
    id: 'skate-001',
    name: 'Santa Cruz Screaming Hand Complete',
    description: 'Classic Screaming Hand graphic on a premium 7-ply maple deck. Fully assembled with Bullet trucks and Slime Balls wheels.',
    price: 109.99,
    inventory: 45,
    sizes: ['7.75"', '8.0"', '8.25"'],
    colors: ['Blue/Black', 'Neon Orange'],
    image: '/assets/skate-001.png',
    gender: 'Completes',
    category: 'Completes'
  },
  {
    id: 'skate-002',
    name: 'Element Section Complete Skateboard',
    description: 'The standard Section deck with thriftwood construction, lightweight Element trucks, and durable 52mm wheels.',
    price: 99.99,
    inventory: 60,
    sizes: ['7.5"', '7.75"', '8.0"'],
    colors: ['Red/Black', 'Rasta'],
    image: '/assets/skate-002.png',
    gender: 'Completes',
    category: 'Completes'
  },
  {
    id: 'skate-003',
    name: 'Toy Machine Monster Complete',
    description: 'Iconic Toy Machine Monster graphics on a high-grade maple deck. Includes rugged Ruckus trucks and Toy Machine wheels.',
    price: 119.99,
    inventory: 30,
    sizes: ['8.0"', '8.25"', '8.5"'],
    colors: ['Green Monster', 'Red Eye'],
    image: '/assets/skate-003.png',
    gender: 'Completes',
    category: 'Completes'
  },
  {
    id: 'skate-004',
    name: 'Almost Neon Logo Complete',
    description: 'Super responsive street and park setup. Lightweight Res-7 deck paired with Tensor trucks and Almost wheels.',
    price: 94.99,
    inventory: 50,
    sizes: ['7.75"', '8.0"'],
    colors: ['Neon Pink', 'Neon Green'],
    image: '/assets/skate-004.png',
    gender: 'Completes',
    category: 'Completes'
  },
  {
    id: 'skate-005',
    name: 'Powell Peralta Golden Dragon Complete',
    description: 'Perfect complete for beginners and intermediate riders, built with premium components in Powell Peralta workshops.',
    price: 89.99,
    inventory: 40,
    sizes: ['7.75"', '8.0"'],
    colors: ['Flying Dragon', 'Golden Crest'],
    image: '/assets/skate-005.png',
    gender: 'Completes',
    category: 'Completes'
  },
  {
    id: 'skate-006',
    name: 'Baker Brand Logo Deck',
    description: 'The legendary Baker Brand Logo deck. Standard OG shape, crafted from premium 7-ply North American maple.',
    price: 59.99,
    inventory: 80,
    sizes: ['8.0"', '8.125"', '8.25"', '8.5"'],
    colors: ['Red/White', 'Black/White'],
    image: '/assets/skate-006.png',
    gender: 'Decks',
    category: 'Decks'
  },
  {
    id: 'skate-007',
    name: 'Primitive Dirty P Deck',
    description: 'Primitive Skateboarding signature deck with a clean, classic logo design and excellent pop.',
    price: 64.99,
    inventory: 55,
    sizes: ['8.0"', '8.125"', '8.25"'],
    colors: ['Gold Foil', 'Silver Foil'],
    image: '/assets/skate-007.png',
    gender: 'Decks',
    category: 'Decks'
  },
  {
    id: 'skate-008',
    name: 'Real Oval Pattern Deck',
    description: 'Engineered for street skateboarding, with a medium concave and strong construction for lasting durability.',
    price: 59.99,
    inventory: 70,
    sizes: ['8.0"', '8.25"', '8.38"', '8.5"'],
    colors: ['Black/Blue', 'Classic Red'],
    image: '/assets/skate-008.png',
    gender: 'Decks',
    category: 'Decks'
  },
  {
    id: 'skate-009',
    name: 'Girl Sanrio Hello Kitty Deck',
    description: 'Limited edition collaboration deck from Girl Skateboards featuring official Hello Kitty graphics.',
    price: 69.99,
    inventory: 24,
    sizes: ['8.0"', '8.25"'],
    colors: ['Pink', 'Cyan'],
    image: '/assets/skate-009.png',
    gender: 'Decks',
    category: 'Decks'
  },
  {
    id: 'skate-010',
    name: 'Deathwish Death Spray Deck',
    description: 'Hardcore street deck with aggressive concave and excellent flick. Built for high impact.',
    price: 59.99,
    inventory: 62,
    sizes: ['8.0"', '8.25"', '8.5"'],
    colors: ['Black/Red', 'Neon Green'],
    image: '/assets/skate-010.png',
    gender: 'Decks',
    category: 'Decks'
  },
  {
    id: 'skate-011',
    name: 'Independent Stage 11 Polished Trucks',
    description: 'Industry-standard high performance trucks. Durable, stable, and quick turning. Price is for a set of two.',
    price: 49.99,
    inventory: 110,
    sizes: ['139 (for 8.0" deck)', '144 (for 8.25" deck)', '149 (for 8.5" deck)'],
    colors: ['Silver', 'Flat Black'],
    image: '/assets/skate-011.png',
    gender: 'Parts',
    category: 'Parts'
  },
  {
    id: 'skate-012',
    name: 'Spitfire Formula Four Wheels',
    description: 'High-performance polyurethane street wheels, resistant to flatspots. Set of 4. Hardness: 99DU.',
    price: 39.99,
    inventory: 150,
    sizes: ['52mm', '53mm', '54mm'],
    colors: ['Classic White/Red', 'Radial Blue'],
    image: '/assets/skate-012.png',
    gender: 'Parts',
    category: 'Parts'
  },
  {
    id: 'skate-013',
    name: 'Bones Reds Bearings',
    description: 'The best-selling skateboard bearings in the world. Pre-lubricated with Speed Cream. Pack of 8 bearings.',
    price: 19.99,
    inventory: 200,
    sizes: ['Standard 8mm'],
    colors: ['Red Dust Shield'],
    image: '/assets/skate-013.png',
    gender: 'Parts',
    category: 'Parts'
  },
  {
    id: 'skate-014',
    name: 'Mob High-Grip Griptape',
    description: 'Premium bubble-free griptape featuring micro-grit silicon-carbide for solid foot traction. 9" x 33" sheet.',
    price: 9.99,
    inventory: 300,
    sizes: ['9" x 33" sheet'],
    colors: ['Black'],
    image: '/assets/skate-014.png',
    gender: 'Parts',
    category: 'Parts'
  },
  {
    id: 'skate-015',
    name: 'Triple Eight Certified Sweatsaver Helmet',
    description: 'Dual-certified safety helmet with premium EPS liner and Sweatsaver fabric. Suitable for skateboarding and biking.',
    price: 54.99,
    inventory: 35,
    sizes: ['S', 'M', 'L'],
    colors: ['Matte Black', 'Matte White', 'Rubber Blue'],
    image: '/assets/skate-015.png',
    gender: 'Safety',
    category: 'Safety'
  }
];

const orders = [];

module.exports = {
  products,
  orders
};
