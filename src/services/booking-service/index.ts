import { notFoundError, notValidTicket, notValidUser } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";


async function getBooking(userId: number) {
    const booking = await bookingRepository.findbooking(userId);
    if(!booking) throw notFoundError()
    return booking;
  }

  async function getAllBookings(roomId:number) {
    const booking = await bookingRepository.findAllBookingsInRoom(roomId);
    if(!booking) throw notFoundError()
    return booking
    
  }

  async function createBooking(roomId:number,userId:number) {
    const createBooking = await bookingRepository.createBooking(roomId,userId)
    if(!createBooking) throw notFoundError()
    return createBooking
  }


  async function findUserNoBooking(userId:number){
    const user = bookingRepository.findUser(userId)
    if(!user) throw notFoundError()
    return user
  }

  async function updateBooking(bookingId:number,roomId:number){
    const booking = bookingRepository.updateBooking(bookingId,roomId)
    if(!booking) throw notValidUser()
    return booking
  }

  const bookingService = {
    getBooking,
    getAllBookings,
    createBooking,
    updateBooking,
    findUserNoBooking
  };
  
  export default bookingService;