// prisma/seeds/tool-categories.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toolCategories = [
  // ═══════════════════════════════════════════
  // FARMING TOOLS
  // ═══════════════════════════════════════════
  {
    categoryCode: 'TL-F01',
    categoryType: 'TOOL_FARMING',
    name: 'Tillage Equipment',
    description: 'Tools and machinery for soil preparation and cultivation',
    examples: ['Tractors', 'Plows', 'Harrows', 'Hoes', 'Cultivators', 'Rippers'],
    displayOrder: 1,
    iconName: 'tractor',
  },
  {
    categoryCode: 'TL-F02',
    categoryType: 'TOOL_FARMING',
    name: 'Irrigation Equipment',
    description: 'Water management tools for crop irrigation',
    examples: ['Water pumps', 'Drip lines', 'Sprinklers', 'Hose reels', 'Water tanks'],
    displayOrder: 2,
    iconName: 'droplets',
  },
  {
    categoryCode: 'TL-F03',
    categoryType: 'TOOL_FARMING',
    name: 'Harvesting Equipment',
    description: 'Tools and machines for crop harvesting',
    examples: ['Combine harvesters', 'Sickles', 'Threshers', 'Reapers', 'Corn shellers'],
    displayOrder: 3,
    iconName: 'wheat',
  },
  {
    categoryCode: 'TL-F04',
    categoryType: 'TOOL_FARMING',
    name: 'Planting & Seeding Equipment',
    description: 'Tools for planting seeds and seedlings',
    examples: ['Seed drills', 'Planters', 'Dibbers', 'Transplanting machines', 'Seed trays'],
    displayOrder: 4,
    iconName: 'sprout',
  },
  {
    categoryCode: 'TL-F05',
    categoryType: 'TOOL_FARMING',
    name: 'Spraying & Pest Control',
    description: 'Equipment for applying pesticides, herbicides, and fertilizers',
    examples: ['Knapsack sprayers', 'Boom sprayers', 'Fumigators', 'Dusters', 'Mist blowers'],
    displayOrder: 5,
    iconName: 'spray-can',
  },
  {
    categoryCode: 'TL-F06',
    categoryType: 'TOOL_FARMING',
    name: 'Storage & Preservation',
    description: 'Equipment for storing and preserving farm produce',
    examples: ['Silos', 'Cold rooms', 'Drying racks', 'Storage bins', 'Hermetic bags'],
    displayOrder: 6,
    iconName: 'warehouse',
  },
  {
    categoryCode: 'TL-F07',
    categoryType: 'TOOL_FARMING',
    name: 'Processing Equipment',
    description: 'Machines for processing agricultural produce',
    examples: ['Rice mills', 'Oil presses', 'Cassava graters', 'Grain mills', 'Juice extractors'],
    displayOrder: 7,
    iconName: 'cog',
  },
  {
    categoryCode: 'TL-F08',
    categoryType: 'TOOL_FARMING',
    name: 'Power Tools & Machinery',
    description: 'Motorised farm equipment and power tools',
    examples: ['Generators', 'Chainsaws', 'Brush cutters', 'Power tillers', 'Water pumps'],
    displayOrder: 8,
    iconName: 'zap',
  },
  {
    categoryCode: 'TL-F09',
    categoryType: 'TOOL_FARMING',
    name: 'Hand Tools',
    description: 'Manual farming tools and implements',
    examples: ['Cutlasses', 'Hoes', 'Rakes', 'Shovels', 'Wheelbarrows', 'Pruning shears'],
    displayOrder: 9,
    iconName: 'hammer',
  },
  {
    categoryCode: 'TL-F10',
    categoryType: 'TOOL_FARMING',
    name: 'Livestock Equipment',
    description: 'Tools and equipment for animal husbandry',
    examples: ['Feeders', 'Drinkers', 'Egg incubators', 'Milking machines', 'Debeakers'],
    displayOrder: 10,
    iconName: 'beef',
  },
  {
    categoryCode: 'TL-F11',
    categoryType: 'TOOL_FARMING',
    name: 'Aquaculture Equipment',
    description: 'Tools for fish farming and aquaculture',
    examples: ['Fish ponds', 'Aerators', 'Fish nets', 'Water testers', 'Fish feeders'],
    displayOrder: 11,
    iconName: 'fish',
  },
  {
    categoryCode: 'TL-F12',
    categoryType: 'TOOL_FARMING',
    name: 'Transport & Hauling',
    description: 'Vehicles and equipment for farm transport',
    examples: ['Trailers', 'Wheelbarrows', 'Carts', 'Pickup trucks', 'Donkey carts'],
    displayOrder: 12,
    iconName: 'truck',
  },

  // ═══════════════════════════════════════════
  // ARTISAN TOOLS
  // ═══════════════════════════════════════════
  {
    categoryCode: 'TL-A01',
    categoryType: 'TOOL_ARTISAN',
    name: 'Sewing & Tailoring Equipment',
    description: 'Tools for tailoring, sewing, and fashion production',
    examples: ['Sewing machines', 'Overlock machines', 'Scissors', 'Measuring tape', 'Irons'],
    displayOrder: 1,
    iconName: 'scissors',
  },
  {
    categoryCode: 'TL-A02',
    categoryType: 'TOOL_ARTISAN',
    name: 'Woodworking Tools',
    description: 'Equipment for carpentry and woodwork',
    examples: ['Circular saws', 'Planers', 'Chisels', 'Wood lathes', 'Routers', 'Drill presses'],
    displayOrder: 2,
    iconName: 'axe',
  },
  {
    categoryCode: 'TL-A03',
    categoryType: 'TOOL_ARTISAN',
    name: 'Welding & Metalwork Equipment',
    description: 'Tools for welding, fabrication, and metalwork',
    examples: ['Welding machines', 'Angle grinders', 'Cutting torches', 'Bending machines', 'Vices'],
    displayOrder: 3,
    iconName: 'flame',
  },
  {
    categoryCode: 'TL-A04',
    categoryType: 'TOOL_ARTISAN',
    name: 'Electrical Tools',
    description: 'Tools for electrical installation and repair',
    examples: ['Multimeters', 'Wire strippers', 'Soldering irons', 'Cable testers', 'Crimping tools'],
    displayOrder: 4,
    iconName: 'plug',
  },
  {
    categoryCode: 'TL-A05',
    categoryType: 'TOOL_ARTISAN',
    name: 'Plumbing Tools',
    description: 'Equipment for plumbing installation and repair',
    examples: ['Pipe wrenches', 'Pipe cutters', 'Threading machines', 'Soldering kits', 'Drain snakes'],
    displayOrder: 5,
    iconName: 'wrench',
  },
  {
    categoryCode: 'TL-A06',
    categoryType: 'TOOL_ARTISAN',
    name: 'Masonry & Construction Tools',
    description: 'Tools for bricklaying, plastering, and construction',
    examples: ['Trowels', 'Spirit levels', 'Concrete mixers', 'Tile cutters', 'Scaffolding'],
    displayOrder: 6,
    iconName: 'building',
  },
  {
    categoryCode: 'TL-A07',
    categoryType: 'TOOL_ARTISAN',
    name: 'Painting & Finishing Tools',
    description: 'Equipment for painting, coating, and finishing work',
    examples: ['Spray guns', 'Paint rollers', 'Compressors', 'Sanders', 'Brushes'],
    displayOrder: 7,
    iconName: 'paint-bucket',
  },
  {
    categoryCode: 'TL-A08',
    categoryType: 'TOOL_ARTISAN',
    name: 'Automotive & Mechanic Tools',
    description: 'Equipment for vehicle repair and maintenance',
    examples: ['Jack stands', 'Socket sets', 'Diagnostic scanners', 'Hydraulic jacks', 'Air compressors'],
    displayOrder: 8,
    iconName: 'car',
  },
  {
    categoryCode: 'TL-A09',
    categoryType: 'TOOL_ARTISAN',
    name: 'Leather & Shoe Making Tools',
    description: 'Tools for leatherwork and shoe making',
    examples: ['Leather cutters', 'Stitching machines', 'Shoe lasts', 'Burnishing tools', 'Riveting kits'],
    displayOrder: 9,
    iconName: 'footprints',
  },
  {
    categoryCode: 'TL-A10',
    categoryType: 'TOOL_ARTISAN',
    name: 'Beauty & Barbing Equipment',
    description: 'Professional equipment for beauty and grooming',
    examples: ['Clippers', 'Hair dryers', 'Sterilizers', 'Styling chairs', 'Nail drills'],
    displayOrder: 10,
    iconName: 'sparkles',
  },
  {
    categoryCode: 'TL-A11',
    categoryType: 'TOOL_ARTISAN',
    name: 'Printing & Signage Equipment',
    description: 'Tools for printing, branding, and signage',
    examples: ['Printers', 'Heat presses', 'Vinyl cutters', 'Laminators', 'Embossers'],
    displayOrder: 11,
    iconName: 'printer',
  },
  {
    categoryCode: 'TL-A12',
    categoryType: 'TOOL_ARTISAN',
    name: 'General Workshop Tools',
    description: 'General purpose tools for any artisan workshop',
    examples: ['Bench drills', 'Tape measures', 'Clamps', 'Toolboxes', 'Workbenches'],
    displayOrder: 12,
    iconName: 'briefcase',
  },
];

async function seedToolCategories() {
  console.log('🔧 Seeding tool categories...\n');

  let created = 0;
  let skipped = 0;

  for (const cat of toolCategories) {
    const existing = await prisma.category.findFirst({
      where: { categoryCode: cat.categoryCode },
    });

    if (existing) {
      console.log(`  ⏭  Skipped (exists): ${cat.categoryCode} — ${cat.name}`);
      skipped++;
      continue;
    }

    await prisma.category.create({
      data: {
        categoryCode: cat.categoryCode,
        categoryType: cat.categoryType as any,
        name: cat.name,
        description: cat.description,
        examples: cat.examples,
        displayOrder: cat.displayOrder,
        iconName: cat.iconName,
        level: 0,
        isActive: true,
        isFeatured: false,
        usageCount: 0,
      },
    });

    console.log(`  ✅ Created: ${cat.categoryCode} — ${cat.name}`);
    created++;
  }

  console.log(`\n🔧 Tool categories seeded: ${created} created, ${skipped} skipped`);
}

// Run standalone or export for main seed
if (require.main === module) {
  seedToolCategories()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}

export { seedToolCategories };