import { prisma } from "@/config";

async function findbooking(userId:number){
    return prisma.booking.findFirst({
        where: {
          userId: userId,
        }
    })}

    async function findAllBookingsInRoom(roomId:number){
        return prisma.booking.findMany({
            where: {
              roomId:roomId
            }
        })}   

    async function createBooking(roomId:number,userId:number) {
        return prisma.booking.create({
            data:{
                roomId:roomId,
                userId:userId
            }

        })
    }
    async function findUser(userId:number){
      return prisma.booking.findMany({
        where:{
          userId:userId
        }
      })
    }

    async function updateBooking(bookingId:number,roomId:number){
      return prisma.booking.update({
        where:{
          id:bookingId
        },
        data:{
          roomId:roomId
        }
        
      })
    }
 
  const bookingRepository = {
    findbooking,
    findAllBookingsInRoom,
    createBooking,
    findUser,
    updateBooking
  };
  
  export default bookingRepository; 