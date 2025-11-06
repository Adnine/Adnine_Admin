export interface UserRecord {
    type: 'explorer' | 'business';
    user_id: string;
    registration_date: string;
    username: string | null;
    first_name?: string | null;
    last_name?: string | null;
    gender?: string | null;
    birthdate?: string | null;
    job_title?: string | null;
    business_name?: string | null;
    initial_date?: string | null;
    location?: string | null;
    phone_number?: string | null;
    status?: string | null;
    slogan?: string | null;
    email?: string | null;
    website?: string | null;
  }
  export interface UsersResponse {
    success: boolean;
    total: number;
    data: UserRecord[];
  }
  export interface UserBalance {
    user_id: string;
    total_balance: number;
    history: Array<{
      date: string;
      transactions: Array<{
        description: string;
        amount: string;
        created_at: string;
        engine_used: string;
      }>;
    }>;
  }