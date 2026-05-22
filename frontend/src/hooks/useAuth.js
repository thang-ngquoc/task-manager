import { login, logout, register } from "@/api/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (email, password) => {
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(error.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    }

    return { handleLogin, isLoading, error };
}

export function useSignup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async (email, password) => {
        setError("");
        setIsLoading(true);

        try {
            await register(email, password);
            navigate("/");
        } catch (err) {
            setError(error.message || "Failed to signup");
        } finally {
            setIsLoading(false);
        }
    }

    return { handleSignup, isLoading, error };
}

export function useLogout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = async () => {
        setError("");
        setIsLoading(true);

        try {
            await logout();
            navigate("/login");
        } catch (err) {
            setError(error.message || "Failed to logout");
        } finally {
            setIsLoading(false);
        }
    }

    return { handleLogout, isLoading, error };
}