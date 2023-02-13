import { ApplicationError } from "@/protocols";

export function notFoundError(): ApplicationError {
  return {
    name: "NotFoundError",
    message: "No result for this search!",
  };
}

export function notValidTicket(): ApplicationError {
  return {
    name: "NotValidTicket",
    message: "Ticket is not valid",
  };
}

export function notValidUser(): ApplicationError {
  return {
    name: "NotValidUser",
    message: "User is not valid",
  };
}