import { prisma } from "@/config";

async function findRoom(roomId:number){
    return prisma.room.findFirst({
        where: {
          id: roomId,
        }
    })}
 
  const RoomRepository = {
    findRoom,
  };
  
  export default RoomRepository; 