export const fetchUserVacancies = async (userId: string) => {
    try {
      const res = await fetch(`https://adnine-backend.onrender.com/api/admin-balance/vacancies/${userId}`);
  
      if (!res.ok) {
        throw new Error(`Failed to fetch user vacancies: ${res.statusText}`);
      }
  
      const data = await res.json();
  
      // ✅ Log the data to inspect the response
      console.log("✅ Vacancies fetched successfully for user:", userId);
      console.log("Vacancies data:", data);
  
      return data; // Array of vacancies
    } catch (err: any) {
      console.error("❌ Error fetching user vacancies:", err);
      throw new Error(err.message || "Failed to fetch user vacancies");
    }
  };