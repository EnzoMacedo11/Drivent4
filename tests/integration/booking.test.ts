import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import e from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createTicketTypeNoHotel,
  createRoomNoVacancy,
  updateBooking,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
    await cleanDb();
  });
  
beforeEach(async () => {
    await init();
    await cleanDb();
  });

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.get("/booking");
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if user have a booking but no valid token", async () => {
    const user = await createUser();
    const token = await generateValidToken(user)
    const hotel = await createHotel()
    const room = await createRoomWithHotelId(hotel.id)
    const booking = await createBooking(user.id,room.id)

    const response = await server.get("/booking").set("Authorization", `Bearer XXXX}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  })

  it("should respond with status 404 if user dont have booking", async () => {
    const user = await createUser();
    const token = await generateValidToken(user)

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  })

  

  it("should respond with status 200 if user have a valid booking and valid token.", async () => {
    const user = await createUser();
    const token = await generateValidToken(user)
    const hotel = await createHotel()
    const room = await createRoomWithHotelId(hotel.id)
    const booking = await createBooking(user.id,room.id)

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
        id: booking.id,
        Room:{
            id:room.id,
            name:room.name,
            capacity:room.capacity
        }
    }
      
    )
  })




})


describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.post("/booking");
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });


  it("should respond with status 403 when user ticket is remote ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when user ticket not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when user ticket without hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 when roomId no vacancy ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const hotel = await createHotel()
    const room = await createRoomNoVacancy(hotel.id)
    const booking = await createBooking(user.id,room.id)
    
    
    const response =(await server.post("/booking").set("Authorization", `Bearer ${token}`));
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 404 when roomId not exist ", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const hotel = await createHotel()
    const room = await createRoomWithHotelId(hotel.id)
    const body = {roomid:0}
    //console.log(room.id)
    const response =(await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body));
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should respond with status 404 when user dont have a ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });



  it("should respond with status 200 if valid booking and valid token.", async () => {
    const user = await createUser();
    const token = await generateValidToken(user)
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    
    const hotel = await createHotel()
    const room = await createRoomWithHotelId(hotel.id)
    const booking = await createBooking(user.id,room.id) //Aqui estou criando um booking, logo quando eu enviar no body o booking id vai ser sempre o proximo
    const body = {roomid:room.id}

    //console.log("room",room)
    //console.log("boo",booking)
    //console.log("body",body)

    const response = (await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body));

    expect(response.status).toBe(httpStatus.OK);
    //console.log(response.body)
    expect(response.body).toEqual({
        bookingId: booking.id + 1  // Por isso aqui coloquei booking.id + 1 
    }
    )
  })
})


describe("POST /booking:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

it("should respond with status 401 if given token is not valid", async () => {
  const token = faker.lorem.word();

  const response = await server.put(`/booking/${1}`).set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(httpStatus.UNAUTHORIZED);
});


it("should respond with status 404 when roomId not exist ", async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);

  const hotel = await createHotel()
  const room = await createRoomWithHotelId(hotel.id)
  const body = {roomid:0}
  //console.log(room.id)
  const response =(await server.put(`/booking/${1}`).set("Authorization", `Bearer ${token}`).send(body));
  expect(response.status).toEqual(httpStatus.NOT_FOUND);
});

it("should respond with status 404 when user dont have a booking ", async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  
  const hotel = await createHotel()
  const room = await createRoomWithHotelId(hotel.id)
  //console.log(room.capacity)
  const body = {roomid:room.id}

  
  
  const response =(await server.put(`/booking/${1}`).set("Authorization", `Bearer ${token}`).send(body));
  expect(response.status).toEqual(httpStatus.NOT_FOUND);
});


it("should respond with status 403 when roomId no vacancy ", async () => {
  const user = await createUser();
  const token = await generateValidToken(user);
  const enrollment = await createEnrollmentWithAddress(user);
  
  const hotel = await createHotel()
  const room = await createRoomNoVacancy(hotel.id)
  //console.log(room.capacity)
  const booking = await createBooking(user.id,room.id)
  const body = {roomid:room.id}
  
  
  const response =(await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));
  expect(response.status).toEqual(httpStatus.FORBIDDEN);
});





it("should respond with status 200 if valid booking and valid token.", async () => {
  const user = await createUser();
  const token = await generateValidToken(user)
  
  const hotel = await createHotel()
  const room = await createRoomWithHotelId(hotel.id)
  const newRoom = await createRoomWithHotelId(hotel.id)
  const booking = await createBooking(user.id,room.id)
  console.log(booking)
  const update = await updateBooking(booking.id,newRoom.id)
  console.log(update)
  const body = {roomid:newRoom.id}

  const response = (await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body));

  expect(response.status).toBe(httpStatus.OK);
  expect(response.body).toEqual({
      bookingId: booking.id 
  }
  )
})
})