import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // 1. Cleanup
  await prisma.settings.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.campaign.deleteMany();

  // 2. Settings
  await prisma.settings.createMany({
    data: [
      { key: "crm_name", value: "NexCRM Professional" },
      { key: "currency", value: "EUR" },
      { key: "email_from", value: "noreply@nexcrm.io" },
    ],
  });

  // 3. User
  const hashedPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@nexcrm.io",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("👤 User created: " + admin.email);

  // 4. Accounts
  const accounts = [];
  for (let i = 0; i < 8; i++) {
    const acc = await prisma.account.create({
      data: {
        name: faker.company.name(),
        industry: faker.company.buzzPhrase(),
        website: faker.internet.url(),
        phone: faker.phone.number(),
        city: faker.location.city(),
        country: faker.location.country(),
        notes: faker.lorem.paragraph(),
      },
    });
    accounts.push(acc);
  }

  // 5. Contacts
  const contacts = [];
  for (const acc of accounts) {
    for (let j = 0; j < 2; j++) {
      const contact = await prisma.contact.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          position: faker.person.jobTitle(),
          accountId: acc.id,
        },
      });
      contacts.push(contact);
    }
  }

  // 6. Leads
  const leadStatuses: any[] = ["new", "contacted", "qualified", "unqualified"];
  for (let k = 0; k < 15; k++) {
    await prisma.lead.create({
      data: {
        title: faker.commerce.productName() + " Project",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        company: faker.company.name(),
        status: leadStatuses[Math.floor(Math.random() * leadStatuses.length)],
        value: faker.number.int({ min: 1000, max: 50000 }),
        score: faker.number.int({ min: 10, max: 95 }),
        userId: admin.id,
      },
    });
  }

  // 7. Deals
  const dealStages: any[] = ["lead", "contacted", "negotiation", "won", "lost"];
  for (let l = 0; l < 10; l++) {
    const acc = accounts[Math.floor(Math.random() * accounts.length)];
    const deal = await prisma.deal.create({
      data: {
        title: "Deal with " + acc.name,
        amount: faker.number.int({ min: 5000, max: 100000 }),
        probability: faker.number.int({ min: 10, max: 90 }),
        stage: dealStages[Math.floor(Math.random() * dealStages.length)],
        accountId: acc.id,
        userId: admin.id,
        closeDate: faker.date.future(),
      },
    });

    // // 8. Quotes & Invoices
    // if (deal?.stage?.name === "won" || deal?.stage?.name === "negotiation") {
    //   const quote = await prisma.quote.create({
    //     data: {
    //       number: "QT-" + faker.string.alphanumeric(6).toUpperCase(),
    //       title: "Devis pour " + deal.title,
    //       status: deal.stage?.name === "won" ? "accepted" : "sent",
    //       totalAmount: deal.amount,
    //       dealId: deal.id,
    //       lines: {
    //         create: [
    //           { description: "Licence Logiciel", quantity: 1, unitPrice: deal.amount * 0.7, total: deal.amount * 0.7 },
    //           { description: "Maintenance Annuelle", quantity: 1, unitPrice: deal.amount * 0.3, total: deal.amount * 0.3 },
    //         ],
    //       },
    //     },
    //   });

    //   if (deal?.stage['name'] === "won") {
    //     await prisma.invoice.create({
    //       data: {
    //         number: "INV-" + faker.string.alphanumeric(6).toUpperCase(),
    //         title: "Facture pour " + deal.title,
    //         status: "paid",
    //         totalAmount: deal.amount,
    //         accountId: acc.id,
    //         quoteId: quote.id,
    //         lines: {
    //           create: [
    //             { description: "Licence Logiciel", quantity: 1, unitPrice: deal.amount * 0.7, total: deal.amount * 0.7 },
    //             { description: "Maintenance Annuelle", quantity: 1, unitPrice: deal.amount * 0.3, total: deal.amount * 0.3 },
    //           ],
    //         },
    //       },
    //     });
    //   }
    // }
  }

  // 9. Activities
  const actTypes: any[] = ["call", "email", "meeting", "note"];
  for (let m = 0; m < 20; m++) {
    await prisma.activity.create({
      data: {
        type: actTypes[Math.floor(Math.random() * actTypes.length)],
        title: faker.lorem.sentence(3),
        description: faker.lorem.sentence(10),
        scheduledAt: faker.date.soon({ days: 10 }),
        userId: admin.id,
        accountId: accounts[Math.floor(Math.random() * accounts.length)].id,
      },
    });
  }

  // 10. Campaigns
  await prisma.campaign.create({
    data: {
      name: "Promotion Printemps 2026",
      subject: "Offre exclusive sur nos services",
      body: "<h1>Bonjour !</h1><p>Profitez de 20% de réduction en utilisant le code SPRING2026.</p>",
      status: "completed",
      totalSent: 1540,
      totalFailed: 23,
      sentAt: new Date(),
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
