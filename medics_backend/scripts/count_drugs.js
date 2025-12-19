const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.drug.count();
    console.log(`COUNT:${count}`);
}
main().finally(() => prisma.$disconnect());
