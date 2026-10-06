// Augments Express's Request type with the fields our middleware/guards attach.
declare namespace Express {
  export interface Request {
    cartSessionToken?: string;
    user?: {
      id: number;
      email: string;
      name: string;
      role: string;
    };
  }
}
