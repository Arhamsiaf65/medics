const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const drugData = [
    // --- Pain Relief ---
    { name: "Panadol Extra", category: "Pain Relief", description: "Effective relief for headaches and fever.", price: 5.0, stock: 100 },
    { name: "Ibuprofen 200mg", category: "Pain Relief", description: "Anti-inflammatory pain reliever.", price: 8.5, stock: 150 },
    { name: "Aspirin 81mg", category: "Pain Relief", description: "Low dose aspirin regimen.", price: 4.0, stock: 200 },
    { name: "Tylenol Regular", category: "Pain Relief", description: "Acetaminophen for pain and fever.", price: 6.0, stock: 120 },
    { name: "Advil Liqui-Gels", category: "Pain Relief", description: "Fast acting liquid filled capsules.", price: 10.0, stock: 80 },
    { name: "Aleve", category: "Pain Relief", description: "All day pain relief.", price: 11.0, stock: 90 },
    { name: "Motrin IB", category: "Pain Relief", description: "Ibuprofen tablets for aches.", price: 9.0, stock: 100 },
    { name: "Excedrin Migraine", category: "Pain Relief", description: "Acetaminophen, Aspirin, and Caffeine.", price: 12.0, stock: 60 },
    { name: "Naproxen Sodium", category: "Pain Relief", description: "Generic Aleve, 220mg.", price: 7.0, stock: 110 },
    { name: "Voltaren Gel", category: "Pain Relief", description: "Topical arthritis pain relief.", price: 15.0, stock: 40 },
    { name: "Salonpas Patch", category: "Pain Relief", description: "Pain relieving patch.", price: 8.0, stock: 75 },
    { name: "Bengay Cream", category: "Pain Relief", description: "Ultra strength pain relieving cream.", price: 7.5, stock: 50 },
    { name: "Icy Hot", category: "Pain Relief", description: "Menthol pain relief balm.", price: 6.5, stock: 65 },
    { name: "Biofreeze", category: "Pain Relief", description: "Cold therapy pain relief.", price: 14.0, stock: 30 },
    { name: "Midol Complete", category: "Pain Relief", description: "Menstrual pain relief.", price: 9.5, stock: 45 },

    // --- Antibiotics & Infection (Prescription-like placeholders) ---
    { name: "Amoxicillin 500mg", category: "Antibiotics", description: "Broad spectrum antibiotic.", price: 15.0, stock: 50 },
    { name: "Augmentin", category: "Antibiotics", description: "Amoxicillin and clavulanate potassium.", price: 25.0, stock: 30 },
    { name: "Azithromycin", category: "Antibiotics", description: "Z-Pak for bacterial infections.", price: 20.0, stock: 40 },
    { name: "Ciprofloxacin", category: "Antibiotics", description: "Antibiotic for various infections.", price: 18.0, stock: 35 },
    { name: "Cephalexin", category: "Antibiotics", description: "Used for bacterial infections.", price: 16.0, stock: 45 },
    { name: "Doxycycline", category: "Antibiotics", description: "Tetracycline antibiotic.", price: 14.0, stock: 55 },
    { name: "Clindamycin", category: "Antibiotics", description: "Treatment for bacterial infections.", price: 22.0, stock: 25 },
    { name: "Metronidazole", category: "Antibiotics", description: "Antibiotic for anaerobic bacteria.", price: 12.0, stock: 60 },
    { name: "Levofloxacin", category: "Antibiotics", description: "Antibiotic for sinuses and skin.", price: 28.0, stock: 20 },
    { name: "Bactrim DS", category: "Antibiotics", description: "Sulfamethoxazole and trimethoprim.", price: 10.0, stock: 70 },

    // --- Cold, Flu, & Cough ---
    { name: "DayQuil Cold & Flu", category: "Cold & Flu", description: "Non-drowsy relief.", price: 12.5, stock: 100 },
    { name: "NyQuil Cold & Flu", category: "Cold & Flu", description: "Nighttime relief.", price: 12.5, stock: 100 },
    { name: "Mucinex DM", category: "Cold & Flu", description: "Expectorant and cough suppressant.", price: 18.0, stock: 80 },
    { name: "Robitussin Honey", category: "Cold & Flu", description: "Cough relief with honey.", price: 11.0, stock: 90 },
    { name: "Sudafed PE", category: "Cold & Flu", description: "Sinus congestion relief.", price: 9.0, stock: 110 },
    { name: "Theraflu Tea", category: "Cold & Flu", description: "Severe cold relief power.", price: 13.0, stock: 60 },
    { name: "Vicks VapoRub", category: "Cold & Flu", description: "Cough suppressant ointment.", price: 8.0, stock: 150 },
    { name: "Halls Menthol", category: "Cold & Flu", description: "Cough drops, honey lemon.", price: 3.0, stock: 300 },
    { name: "Ricola Herb", category: "Cold & Flu", description: "Natural herb cough drops.", price: 4.0, stock: 250 },
    { name: "Delsym 12hr", category: "Cold & Flu", description: "Cough relief liquid.", price: 16.0, stock: 40 },
    { name: "Sambucol Elderberry", category: "Cold & Flu", description: "Immune support syrup.", price: 15.0, stock: 50 },
    { name: "Airborne Gummies", category: "Cold & Flu", description: "Immune support supplement.", price: 14.0, stock: 70 },
    { name: "Emergen-C", category: "Cold & Flu", description: "Vitamin C fizzy drink mix.", price: 12.0, stock: 85 },
    { name: "Cepacol", category: "Cold & Flu", description: "Sore throat lozenges.", price: 5.5, stock: 120 },
    { name: "Chloraseptic Spray", category: "Cold & Flu", description: "Sore throat warming spray.", price: 7.0, stock: 90 },

    // --- Allergies ---
    { name: "Claritin 24hr", category: "Allergy", description: "Non-drowsy allergy relief.", price: 20.0, stock: 80 },
    { name: "Zyrtec Allergy", category: "Allergy", description: "Fast relief for indoor/outdoor allergies.", price: 22.0, stock: 75 },
    { name: "Allegra 24hr", category: "Allergy", description: "Fexofenadine allergy relief.", price: 21.0, stock: 70 },
    { name: "Benadryl Ultratabs", category: "Allergy", description: "Diphenhydramine allergy relief.", price: 6.0, stock: 150 },
    { name: "Flonase Spray", category: "Allergy", description: "Nasal allergy relief spray.", price: 18.0, stock: 60 },
    { name: "Nasacort", category: "Allergy", description: "24hr allergy nasal spray.", price: 19.0, stock: 50 },
    { name: "Xyzal", category: "Allergy", description: "24hr allergy relief.", price: 23.0, stock: 45 },
    { name: "Visine -A", category: "Allergy", description: "Eye allergy relief.", price: 7.0, stock: 90 },
    { name: "Pataday", category: "Allergy", description: "Once daily eye allergy itch relief.", price: 16.0, stock: 35 },
    { name: "Zodryl AC", category: "Allergy", description: "Allergy congestion relief.", price: 14.0, stock: 25 },

    // --- Vitamins & Supplements ---
    { name: "Centrum Adult", category: "Vitamins", description: "Multivitamin for adults.", price: 12.0, stock: 100 },
    { name: "One A Day Men", category: "Vitamins", description: "Multivitamin for men.", price: 11.0, stock: 90 },
    { name: "One A Day Women", category: "Vitamins", description: "Multivitamin for women.", price: 11.0, stock: 90 },
    { name: "Vitamin C 1000mg", category: "Vitamins", description: "Immune support.", price: 9.0, stock: 150 },
    { name: "Vitamin D3 2000IU", category: "Vitamins", description: "Bone health support.", price: 8.0, stock: 160 },
    { name: "Fish Oil Omega-3", category: "Vitamins", description: "Heart health support.", price: 15.0, stock: 80 },
    { name: "Magnesium Citrate", category: "Vitamins", description: "Muscle and nerve support.", price: 10.0, stock: 70 },
    { name: "Zinc 50mg", category: "Vitamins", description: "Immune health.", price: 7.0, stock: 110 },
    { name: "B-Complex", category: "Vitamins", description: "Energy support.", price: 9.5, stock: 85 },
    { name: "Calcium + D3", category: "Vitamins", description: "Bone strength.", price: 13.0, stock: 65 },
    { name: "Probiotic 10", category: "Vitamins", description: "Digestive health.", price: 20.0, stock: 50 },
    { name: "Melatonin 5mg", category: "Vitamins", description: "Sleep support gummies.", price: 11.0, stock: 100 },
    { name: "Biotin 10000mcg", category: "Vitamins", description: "Hair, skin, and nails.", price: 14.0, stock: 60 },
    { name: "Iron Supplement", category: "Vitamins", description: "For iron deficiency.", price: 8.5, stock: 90 },
    { name: "Folic Acid", category: "Vitamins", description: "Prenatal health.", price: 6.0, stock: 80 },

    // --- Digestive Health ---
    { name: "Tums Ultra", category: "Digestive", description: "Antacid calcium carbonate.", price: 6.0, stock: 200 },
    { name: "Pepto Bismol", category: "Digestive", description: "Upset stomach reliever.", price: 8.0, stock: 120 },
    { name: "Imodium A-D", category: "Digestive", description: "Anti-diarrheal.", price: 12.0, stock: 70 },
    { name: "Miralax", category: "Digestive", description: "Laxative powder.", price: 18.0, stock: 60 },
    { name: "Prilosec OTC", category: "Digestive", description: "Acid reducer.", price: 22.0, stock: 50 },
    { name: "Nexium 24hr", category: "Digestive", description: "Acid reflux relief.", price: 24.0, stock: 45 },
    { name: "Zantac 360", category: "Digestive", description: "Heartburn prevention.", price: 15.0, stock: 65 },
    { name: "Gas-X", category: "Digestive", description: "Extra strength gas relief.", price: 9.0, stock: 85 },
    { name: "Lactaid", category: "Digestive", description: "Lactase enzyme supplement.", price: 13.0, stock: 55 },
    { name: "Metamucil", category: "Digestive", description: "Fiber supplement.", price: 16.0, stock: 40 },
    { name: "Dulcolax", category: "Digestive", description: "Stool softener.", price: 8.0, stock: 75 },
    { name: "Alka-Seltzer", category: "Digestive", description: "Effervescent antacid.", price: 7.0, stock: 130 },

    // --- First Aid & Topicals ---
    { name: "Band-Aid Variety", category: "First Aid", description: "Assorted adhesive bandages.", price: 5.0, stock: 300 },
    { name: "Neosporin", category: "First Aid", description: "Antibiotic ointment.", price: 7.0, stock: 150 },
    { name: "Hydrogen Peroxide", category: "First Aid", description: "Antiseptic.", price: 2.0, stock: 200 },
    { name: "Isopropyl Alcohol", category: "First Aid", description: "Rubbing alcohol 70%.", price: 3.0, stock: 200 },
    { name: "Cortizone 10", category: "First Aid", description: "Itch relief cream.", price: 8.0, stock: 90 },
    { name: "Bacitracin", category: "First Aid", description: "First aid antibiotic.", price: 6.0, stock: 110 },
    { name: "Gauze Pads", category: "First Aid", description: "Sterile pads.", price: 4.0, stock: 150 },
    { name: "Medical Tape", category: "First Aid", description: "Adhesive tape.", price: 3.5, stock: 140 },
    { name: "Burn Jel", category: "First Aid", description: "Relief for minor burns.", price: 6.5, stock: 60 },
    { name: "Calamine Lotion", category: "First Aid", description: "Drying lotion for poison ivy.", price: 5.0, stock: 80 },
    { name: "Epsom Salt", category: "First Aid", description: "Soaking aid for minor sprains.", price: 4.5, stock: 100 },
    { name: "Elastic Bandage", category: "First Aid", description: "Compression wrap.", price: 5.5, stock: 70 },
    { name: "Thermometer", category: "First Aid", description: "Digital thermometer.", price: 12.0, stock: 50 },

    // --- Chronic & Cardiovascular (Mock) ---
    { name: "Lisinopril 10mg", category: "Cardiovascular", description: "Blood pressure medication.", price: 10.0, stock: 100 },
    { name: "Amlodipine 5mg", category: "Cardiovascular", description: "Calcium channel blocker.", price: 12.0, stock: 90 },
    { name: "Metoprolol 50mg", category: "Cardiovascular", description: "Beta blocker.", price: 11.0, stock: 95 },
    { name: "Atorvastatin 20mg", category: "Cardiovascular", description: "Cholesterol medication.", price: 15.0, stock: 85 },
    { name: "Metformin 500mg", category: "Diabetes", description: "Blood sugar control.", price: 8.0, stock: 120 },
    { name: "Insulin Syringes", category: "Diabetes", description: "100 count.", price: 25.0, stock: 40 },
    { name: "Glucometer Strips", category: "Diabetes", description: "Test strips 50ct.", price: 30.0, stock: 45 },
    { name: "Omeprazole 20mg", category: "Digestive", description: "Prescription strength acid reducer.", price: 14.0, stock: 60 },
    { name: "Levothyroxine 50mcg", category: "Hormone", description: "Thyroid medication.", price: 10.0, stock: 110 },
    { name: "Gabapentin 300mg", category: "Neurology", description: "Nerve pain medication.", price: 18.0, stock: 55 },

    // --- Personal Care ---
    { name: "CeraVe Lotion", category: "Skin Care", description: "Moisturizing lotion.", price: 14.0, stock: 80 },
    { name: "Cetaphil Cleanser", category: "Skin Care", description: "Gentle skin cleanser.", price: 12.0, stock: 85 },
    { name: "Sunscreen SPF 50", category: "Skin Care", description: "Broad spectrum protection.", price: 10.0, stock: 100 },
    { name: "ChapStick Classic", category: "Skin Care", description: "Lip balm.", price: 2.0, stock: 300 },
    { name: "Hand Sanitizer", category: "Personal Care", description: "Kills 99.9% germs.", price: 4.0, stock: 250 },
    { name: "Wet Ones", category: "Personal Care", description: "Antibacterial hand wipes.", price: 3.5, stock: 150 },
    { name: "Q-Tips", category: "Personal Care", description: "Cotton swabs.", price: 4.0, stock: 180 },
    { name: "Cotton Balls", category: "Personal Care", description: "100 count.", price: 3.0, stock: 160 },
    { name: "Dental Floss", category: "Dental", description: "Mint waxed.", price: 3.0, stock: 200 },
    { name: "Listerine", category: "Dental", description: "Mouthwash antiseptic.", price: 7.0, stock: 90 },
    { name: "Colgate Total", category: "Dental", description: "Whitening toothpaste.", price: 4.5, stock: 150 },
    { name: "Sensodyne", category: "Dental", description: "Toothpaste for sensitive teeth.", price: 6.0, stock: 100 },
];

async function main() {
    const email = 'admin@gmail.com';
    const password = '@dminpassword';
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Seed Admin & Doctor ---
    const rootAdmin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Root Admin',
            password: hashedPassword,
            role: 'ROOT',
        },
    });

    const demoDoctor = await prisma.user.upsert({
        where: { email: 'doctor@gmail.com' },
        update: {},
        create: {
            email: 'doctor@gmail.com',
            name: 'Demo Doctor',
            password: hashedPassword,
            role: 'DOCTOR',
        },
    });

    console.log("Users seeded:", { rootAdmin: rootAdmin.email, demoDoctor: demoDoctor.email });

    // --- Seed Drugs ---
    console.log(`Seeding ${drugData.length} drugs...`);
    let drugsAdded = 0;

    for (const drug of drugData) {
        // Check existence by name to avoid duplicates
        const exists = await prisma.drug.findFirst({ where: { name: drug.name } });
        if (!exists) {
            await prisma.drug.create({
                data: {
                    name: drug.name,
                    category: drug.category,
                    description: drug.description,
                    actualPrice: drug.price,
                    // Sale price slightly lower or null randomly for variety, simplified here
                    salePrice: null,
                    rating: 4.5, // Default good rating
                    itemsInfo: "1 item", // Placeholder
                    inStock: true,
                    imageUrl: "https://via.placeholder.com/150" // Placeholder image
                }
            });
            drugsAdded++;
        }
    }
    console.log(`Drugs seeded. New drugs added: ${drugsAdded}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
