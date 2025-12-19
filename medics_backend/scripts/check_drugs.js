const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.drug.count();
        console.log(`Total drugs in database: ${count}`);

        const sample = await prisma.drug.findFirst({
            where: { name: 'Panadol Extra' }
        });
        console.log('Sample drug:', sample);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
