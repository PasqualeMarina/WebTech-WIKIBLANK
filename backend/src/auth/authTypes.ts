import type { AuthTokenPayload } from './jwtService.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthTokenPayload;
  }
}
