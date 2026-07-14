const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const book = await prisma.book.findUnique({
    where: { id: 'cmp0ls4ks000004ldqhs3rtbu' }
  });
  console.log(JSON.stringify(book, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
