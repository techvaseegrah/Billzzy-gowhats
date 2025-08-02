// types/settings.d.ts
export interface OrganisationDetails {
    id: number;
    name: string;
    email: string;
    phone: string;
    shopName: string;
    flatNo: string;
    street: string;
    district: string;
    state: string;
    country: string;
    pincode: string;
    mobileNumber: string;
    landlineNumber?: string | null;
    websiteAddress?: string | null;
    gstNumber?: string | null;
    companySize: string;
    whatsappNumber?: string | null;
    razorpayAccessToken?: string | null;
  }