import { Router } from "express";
import { API_V1_PREFIX } from "../config/constants.js";
import { v1Routes } from "./v1/routes.js";

const router = Router();

router.use(API_V1_PREFIX, v1Routes);

export const apiRouter = router;
