// utils/fetchPendingTools.ts
export interface PendingTool {
    id: string;
    user_id: string;
    tool_name: string | null;
    tool_image: string | null;
    status: string;
    // add other fields you need
  }
  
  export interface PendingToolsResponse {
    success: boolean;
    page: number;
    limit: number;
    total: number;
    data: PendingTool[];
  }
  
  /**
   * Fetch pending tools from the backend
   * @param page number (default 1)
   * @param limit number of items per page (default 10)
   * @returns PendingToolsResponse
   */
  export const fetchPendingTools = async (
    page: number = 1,
    limit: number = 10
  ): Promise<PendingToolsResponse> => {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch(`http://192.168.1.4:3000/api/pending-tools?${query}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch pending tools: ${res.statusText}`);
      }
      const data: PendingToolsResponse = await res.json();
      return data;
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Failed to fetch pending tools');
    }
  };
  export const updateToolStatus = async (toolId: string, newStatus: string) => {
    const res = await fetch("http://192.168.1.4:3000/api/pending-tools/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, newStatus }),
    });
  
    if (!res.ok) {
      throw new Error(`Failed to update tool status: ${res.statusText}`);
    }
  
    return res.json();
  };
  