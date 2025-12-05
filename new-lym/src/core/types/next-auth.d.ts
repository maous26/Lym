import { SubscriptionPlan } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscriptionPlan: SubscriptionPlan;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    subscriptionPlan: SubscriptionPlan;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    subscriptionPlan: SubscriptionPlan;
  }
}
