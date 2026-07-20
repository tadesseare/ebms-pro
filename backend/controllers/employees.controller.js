import prisma from "../Lib/prisma.js";


/**
 * GET ALL EMPLOYEES
 */
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: "desc" }
    });

    res.json(employees);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * CREATE EMPLOYEE
 */
export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, position, salary } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newEmployee = await prisma.employee.create({
      data: { name, email, phone, position, salary }
    });

    res.json(newEmployee);
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE EMPLOYEE
 */
export const updateEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, position, salary } = req.body;

    const updated = await prisma.employee.update({
      where: { id },
      data: { name, email, phone, position, salary }
    });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE EMPLOYEE
 */
export const deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.employee.delete({
      where: { id }
    });

    res.json({ message: "Employee deleted" });
  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


