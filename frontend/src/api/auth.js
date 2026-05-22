import { 
    signUp, 
    signIn, 
    signOut,
    confirmSignUp,
    getCurrentUser,
    fetchAuthSession
} from "aws-amplify/auth";

export const register = async (email, password) => { 
    return await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
    });
};

export const confirmRegistration = async (email, code) => {
    return await confirmSignUp({
        username: email,
        password
    });
};

export const login = async (email, password) => {
    await signIn({
        username: email,
        password,
    });
    return await getAccessToken();
};

export const getAccessToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString();
};

export const logout = async () => {
    await signOut();
};

export const getCurrentUserInfo = async () => {
    return await getCurrentUser();
}