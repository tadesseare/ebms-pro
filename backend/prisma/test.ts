import prisma from "../Lib/prisma.js";

async function testDatabase() {
  try {
    const users = await prisma.user.findMany();

    console.log("Database connection successful.");
    console.log(users);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
