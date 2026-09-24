import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { conversationWords } from "../src/data/conversation-words";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (const item of conversationWords) {
    await prisma.word.upsert({
      where: { english: item.english },
      update: {
        difficulty: item.difficulty,
        isActive: true,
        meanings: {
          deleteMany: {},
          create: item.meanings.map((meaning) => ({ meaning })),
        },
      },
      create: {
        english: item.english,
        difficulty: item.difficulty,
        meanings: { create: item.meanings.map((meaning) => ({ meaning })) },
      },
    });
  }
  console.log(`Seeded ${conversationWords.length} conversation words.`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
