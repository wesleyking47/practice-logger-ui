// Define your types (or import them from a types file)
export interface PracticeSession {
  id: string;
  date: string;
  notes: string;
  minutes: number;
  activity: string;
}

const API_BASE_URL = "http://localhost:5270";

export const PracticeSessionService = {
  async getAll(): Promise<{ sessions: PracticeSession[] }> {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }
    return response.json() as Promise<{ sessions: PracticeSession[] }>;
  },

  async create(session: Omit<PracticeSession, "id">): Promise<PracticeSession> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json() as Promise<PracticeSession>;
  },
};
