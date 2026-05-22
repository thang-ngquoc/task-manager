import { login, logout, register } from "@/api/auth";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/auth/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}

export function useLogin() {
    const navigate = useNavigate();
    const { checkAuth } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (email, password) => {
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            await checkAuth();
            navigate("/");
        } catch (err) {
            setError(err.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    }

    return { handleLogin, isLoading, error };
}

export function useSignup() {
    const navigate = useNavigate();
    const { checkAuth } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async (email, password) => {
        setError("");
        setIsLoading(true);

        try {
            await register(email, password);
            await checkAuth();
            navigate("/confirm");
            return true;
        } catch (err) {
            setError(err.message || "Failed to signup");
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    return { handleSignup, isLoading, error };
}

export function useLogout() {
    const navigate = useNavigate();
    const { logout: ctxLogout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = async () => {
        setError("");
        setIsLoading(true);

        try {
            await ctxLogout();
            navigate("/login");
        } catch (err) {
            setError(err.message || "Failed to logout");
        } finally {
            setIsLoading(false);
        }
    }

    return { handleLogout, isLoading, error };
}