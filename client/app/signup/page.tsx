"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/utils/routes";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isSignupEnabled, setIsSignupEnabled] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // If user is already logged in, redirect to dashboard instead of signup
    if (token) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [router]);

  const evaluatePasswordStrength = (password: string): string => {
    const criteria = [
      password.length >= 8,           // Length at least 8
      /[A-Z]/.test(password),        // Contains uppercase letter  
      /[a-z]/.test(password),        // Contains lowercase letter
      /[0-9]/.test(password),        // Contains number
      /[@$!%*?&]/.test(password)     // Contains special character
    ];

    const strength = criteria.filter(Boolean).length;

    const strengthMap = {
      0: "Very Weak",
      1: "Very Weak", 
      2: "Weak",
      3: "Moderate", 
      4: "Strong",
      5: "Very Strong"
    };

    return strengthMap[strength as keyof typeof strengthMap] || "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const strength = evaluatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    // Enable signup if password is at least Moderate strength and email is valid
    setIsSignupEnabled(
      (strength === "Moderate" || strength === "Strong" || strength === "Very Strong") && 
      email.includes('@') && email.includes('.')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const jsonData = await response.json();
      // Save token and userId to localStorage
      localStorage.setItem("token", jsonData.data.token);
      localStorage.setItem("userId", jsonData.data.user._id);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      setError("Signup failed. Please check your details.");
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold">Signup</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div
                className={`h-2 rounded ${
                  passwordStrength === "Very Weak"
                    ? "bg-red-500"
                    : passwordStrength === "Weak"
                    ? "bg-orange-500"
                    : passwordStrength === "Moderate"
                    ? "bg-yellow-500"
                    : passwordStrength === "Strong"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              />
              <p className="mt-1 text-sm text-gray-700">Strength: {passwordStrength}</p>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!isSignupEnabled}
          className={`w-full py-2 px-4 rounded transition-colors duration-300 ${
            isSignupEnabled
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Signup
        </button>
        <div className="text-center mt-4">
          <Link href={ROUTES.LOGIN} className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
