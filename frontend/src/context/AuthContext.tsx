import { createContext } from "react";

export type Role = "Waiter" | "Manager" | "Chef";

export interface User {
    name: string;
    role: Role;
}

export const AuthContext = createContext<User | null>(null);
