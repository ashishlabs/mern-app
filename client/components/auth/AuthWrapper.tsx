"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ROUTES } from "@/utils/routes";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect to login if no token exists on initial load
    if (!token) {
      router.push(`${ROUTES.LOGIN}?sessionExpired=true`);
      return;
    }

    // Monkey-patch fetch to handle 401 globally
    const originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);

      if (response.status === 401) {
        // Clear token, show snackbar, and redirect to login
        localStorage.removeItem("token");
        setSnackbarOpen(true); // Show the snackbar
        setTimeout(() => {
          router.push(ROUTES.LOGIN); 
        }, 1000); 
        return response;
      }

      return response;
    };
  }, [router]);

  return (
    <>
      {children}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={2000} // Hide after 2 seconds
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setSnackbarOpen(false)}>
          Session expired. Please log in again.
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthWrapper;
