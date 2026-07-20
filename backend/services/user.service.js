import prisma from "../lib/prisma.js";

export const UserService = {
  async createUser(data) {
    return prisma.user.create({ data });
  },

  async getUsers() {
    return prisma.user.findMany();
  },

  async getUserById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  async updateUserRole(id, role) {
    return prisma.user.update({
      where: { id: Number(id) },
      data: { role }
    });
  },

  async deleteUser(id) {
    return prisma.user.delete({ where: { id: Number(id) } });
  }
};
