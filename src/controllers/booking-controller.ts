import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";
import roomService from "@/services/room-service";
import ticketService from "@/services/tickets-service";
import { number } from "joi";
import userService from "@/services/users-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(Number(userId));
    const room = await roomService.getRoom(booking.roomId)
    //console.log(booking.roomId)
    //console.log(room)
    return res.status(httpStatus.OK).send({
        
        id: booking.id,
        Room: {
            id:room.id,
            name:room.name,
            capacity:room.capacity
        }
    }
    );
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    };
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const {roomid}  = req.body

  
    try {
        const ticket = await ticketService.getTicketByUserIdValid(userId)
         const room = await roomService.getRoom(Number(roomid))
        
         //console.log(room)
         const bookingInRoom = await bookingService.getAllBookings(Number(roomid))

         //console.log(bookingInRoom)

         if(room.capacity <= bookingInRoom.length){
          res.sendStatus(httpStatus.FORBIDDEN)
         }

         const createBooking = await bookingService.createBooking(Number(roomid),Number(userId))
         //console.log(createBooking.id)
         return res.status(httpStatus.OK).send({
          bookingId: createBooking.id,
          }
      );
        

    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }


  export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const {bookingId} = req.params
    const {roomid}  = req.body

  
    try {
      const userBooking = await bookingService.findUserNoBooking(Number(userId))
      if(userBooking.length === 0){
        return res.sendStatus(httpStatus.NOT_FOUND)
      }

      const room = await roomService.getRoom(Number(roomid))
      const booking = await bookingService.createBooking(Number(roomid),Number(userId))
      const bookingInRoom = await bookingService.getAllBookings(Number(roomid))
      if(room.capacity <= bookingInRoom.length){
        return res.sendStatus(httpStatus.FORBIDDEN)
       }
      

     const updateBooking = await bookingService.updateBooking(Number(bookingId), Number(roomid))
     //console.log(updateBooking)

     return res.status(httpStatus.OK).send({
      bookingId: updateBooking.id
      }
  );
        

    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }