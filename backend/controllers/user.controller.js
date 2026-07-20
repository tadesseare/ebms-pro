import { UserService } from "../services/user.service.js";

export const createUser = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getUsers();

    res.status(200).json({
      message: "Users fetched successfully",
      users
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const updated = await UserService.updateUserRole(
      req.params.id,
      req.body.role
    );

    res.status(200).json({
      message: "User role updated successfully",
      user: updated
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.params.id);

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
