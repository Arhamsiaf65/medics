
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.doctor.findMany();
    console.log("Total Doctors:", doctors.length);
    doctors.forEach(d => {
        console.log(`- Name: ${d.name}, Specialty: ${d.specialty}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
