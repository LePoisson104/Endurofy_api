import express, { Router } from "express";
const router: Router = express.Router();

router.route("/login").post();
router.route("/signup").post();
router.route("/refresh").get();
router.route("logout").post();

export default router;
