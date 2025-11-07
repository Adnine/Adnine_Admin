import type { UserBalance, UsersResponse } from "./types";

export const fetchAllUsers = async (
  options?: { explorers?: boolean; businesses?: boolean }
): Promise<UsersResponse> => {
  try {
    const baseUrl = `https://adnine-backend.onrender.com/api/pending-tools/all-users`;

    // Build query params dynamically
    const queryParams = new URLSearchParams();
    if (options?.explorers) queryParams.append("explorers", "true");
    if (options?.businesses) queryParams.append("businesses", "true");

    const url =
      queryParams.toString().length > 0
        ? `${baseUrl}?${queryParams.toString()}`
        : baseUrl;

    console.log("📡 Fetching all users from:", url);

    const res = await fetch(url);

    console.log("🧾 Response status:", res.status, res.statusText);

    const rawText = await res.text();
    console.log("📦 Raw response text:", rawText);

    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.statusText}`);
    }

    // Try parsing JSON safely
    let data: UsersResponse;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("🚨 Failed to parse JSON:", parseErr);
      throw new Error("Invalid JSON response from backend");
    }

    // ✅ Log structured data
    console.log("✅ Parsed UsersResponse:", {
      success: data?.success,
      count: Array.isArray(data?.data) ? data.data.length : 0,
      sample: data?.data?.slice?.(0, 2), // Show only first 2 users
    });

    return data;
  } catch (err: any) {
    console.error("❌ Error in fetchAllUsers:", err);
    throw new Error(err.message || "Failed to fetch users");
  }
};

  export const fetchUserBalance = async (userId: string): Promise<UserBalance> => {
    try {
      console.log("📡 Fetching user balance for:", userId);
  
      const res = await fetch(`https://adnine-backend.onrender.com/api/admin-balance/balance/${userId}`);
  
      console.log("🧾 Response status:", res.status);
  
      const data = await res.json(); // simpler than text + JSON.parse
      console.log("📦 Parsed response data:", data);
  
      if (!res.ok) throw new Error(`Failed to fetch user balance — ${res.status}: ${res.statusText}`);
  
      return data;
    } catch (err) {
      console.error("🚨 Error in fetchUserBalance:", err);
      throw err;
    }
  };
  
  export const fetchAllUserBalances = async () => {
    const res = await fetch('https://adnine-backend.onrender.com/api/admin-balance/balances');
    if (!res.ok) throw new Error('Failed to fetch user balances');
    return await res.json();
  };
