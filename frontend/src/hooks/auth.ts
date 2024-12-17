import { useState } from "react";
import { ILOGINRESPONSE } from "../@types";
import { instance } from "../config";

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (payload: {
    email: string;
    password: string;
  }): Promise<ILOGINRESPONSE> => {
    try {
      setLoading(true);
      const response = await instance.post<ILOGINRESPONSE>("/auth/join", payload);
      return response.data; // Return only the data
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Explicitly throw the error for proper handling
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    login,
  };
};
