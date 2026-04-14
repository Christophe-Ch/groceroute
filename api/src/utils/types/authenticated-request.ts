import { Request } from 'express';
import { User } from '@users/models/user.entity';

export type AuthenticatedRequest = Request & { user: User };
