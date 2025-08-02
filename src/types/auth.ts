import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      shopName: string;
      endDate: Date;
      subscriptionType: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    shopName: string;
    endDate: Date;
    subscriptionType: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    shopName: string;
    endDate: Date;
    subscriptionType: string;
  }
}