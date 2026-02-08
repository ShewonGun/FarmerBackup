import express from "express";
import { signup, login, viewAccount, deactivateAccount, getAllUsers } from "../../controllers/adminControllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user/:userId", viewAccount);
router.put("/user/:userId/deactivate", deactivateAccount);
router.get("/users", getAllUsers);

export default router;