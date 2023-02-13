import { notFoundError } from "@/errors";
import RoomRepository from "@/repositories/room-repository";

async function getRoom(roomId: number) {
    const room = await RoomRepository.findRoom(roomId);
    if(!room) throw notFoundError()
    return room;
  }



  const roomService = {
    getRoom
  };
  
  export default roomService;