import { SetMetadata } from '@nestjs/common';

export const Rolse = (...roles: string[]) => SetMetadata('roles', roles);
