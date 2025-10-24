import { useState, useEffect } from "react";
import usersApi from "@/services/api/users";
import AuthStorage from "@/services/storage/auth";

/**
 * Custom hook to fetch and manage user role from the backend.
 * @returns The current user role (e.g., "ADMIN", "USER") or empty string if not loaded
 */
export const useUserRole = (): string => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      const authStorage = AuthStorage.getInstance();
      const userEmail = authStorage.getEmail();

      if (userEmail) {
        try {
          const role = await usersApi.getUserRole(userEmail);
          setUserRole(role);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  return userRole;
};
