import { useState, useEffect } from "react";

/**
 * Custom hook to fetch and manage user role from the backend.
 * @returns The current user role (e.g., "ADMIN", "USER") or empty string if not loaded
 */
export const useUserRole = (): string => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        try {
          const response = await fetch(
            `http://localhost:3000/user/role?userEmail=${userEmail}`
          );
          const data = await response.json();
          setUserRole(data.userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  return userRole;
};
