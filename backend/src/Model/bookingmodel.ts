export interface Booking {
    Id?: number;
    Sports: string;
    Date: string; // ISO format e.g. '2025-09-18'
    StartTime: number;
    EndTime: number;
    Amount: number;
    CreatedBy: string;
  }
  