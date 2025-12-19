const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchDrugs(query, category) {
    console.log(`Searching for name: "${query}", category: "${category}"`);
    const where = {};
    if (query) where.name = { contains: query, mode: "insensitive" };
    if (category) where.category = { contains: category, mode: "insensitive" };

    const drugs = await prisma.drug.findMany({
        where,
        select: { name: true, category: true },
        take: 5,
    });
    console.log("Found:", drugs);
}

async function main() {
    await searchDrugs(null, "Pain Relief");
    await searchDrugs("Vitamin", null);
    await prisma.$disconnect();
}

main();
