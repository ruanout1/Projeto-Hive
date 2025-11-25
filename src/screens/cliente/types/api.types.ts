export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
  }
  
  export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }