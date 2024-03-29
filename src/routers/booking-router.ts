import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { createBooking, getBooking, putBooking } from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", createBooking)
  .put("/:bookingId", putBooking );

export { bookingRouter };