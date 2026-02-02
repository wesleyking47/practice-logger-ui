// Define your types (or import them from a types file)
export interface PracticeSession {
  id: string;
  date: string;
  notes: string;
  minutes: number;
  activity: string;
}

const API_BASE_URL =
  typeof process !== "undefined" && process.env.VITE_API_URL
    ? process.env.VITE_API_URL
    : "http://localhost:5270";

function buildAuthHeaders(token?: string, contentType?: string): HeadersInit {
  const headers: Record<string, string> = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const PracticeSessionService = {
  async getAll(token?: string): Promise<{ sessions: PracticeSession[] }> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_BASE_URL}/sessions`, { headers });
    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch sessions");
    }
    return response.json() as Promise<{ sessions: PracticeSession[] }>;
  },

  async create(
    session: Omit<PracticeSession, "id">,
    token?: string
  ): Promise<PracticeSession> {
    const headers = buildAuthHeaders(token, "application/json");
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<PracticeSession>;
  },

  async delete(id: number, token?: string): Promise<void> {
    const headers = buildAuthHeaders(token);
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async update(session: PracticeSession, token?: string): Promise<void> {
    const headers = buildAuthHeaders(token, "application/json");
    const response = await fetch(`${API_BASE_URL}/sessions/${session.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },
};
