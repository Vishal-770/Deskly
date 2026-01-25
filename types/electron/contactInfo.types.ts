export interface ContactDetail {
  department: string;
  description: string;
  email: string;
}

export interface ContactInfoResponse {
  success: boolean;
  data?: ContactDetail[];
  error?: string;
}
