import React, { useState, useRef } from "react";
import type { Role } from "../context/AuthContext";
import { api } from "../services/api";

interface LoginViewProps {
    onLogin: (role: Role, name: string, token: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<Role>("Waiter");
    const [pin, setPin] = useState<string[]>(["", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    const pinRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value as Role)
    };

    const handlePinChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return;
        const newPin = [...pin]
        newPin[index] = value.slice(-1);
        setPin(newPin)

        if (value !== "" && index < 3) {
            pinRefs[index + 1].current?.focus();
        }

    };

    const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (pin[index] !== "") {
                const newPin = [...pin];
                newPin[index] = ""
                setPin(newPin);
            }
            else if (index > 0) {
                pinRefs[index - 1].current?.focus();
                const newPin = [...pin]
                newPin[index - 1] = "";
                setPin(newPin)
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const pinString = pin.join("");
        try {
            const data = await api.login(username.toLowerCase(), pinString);
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            onLogin(data.role, data.name, data.access);
        } catch (err) {
            setError("Invalid username or password. Please try again.")
            setPin(["", "", "", ""]);
            pinRefs[0].current?.focus();
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-full h-full flex items-center justify-center bg-[#08090c] overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 bg-[#08090c]/85 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider animate-pulse text-center px-4">
                            Verifying Credentials... <br />
                            <span className="text-[10px] text-gray-500 mt-1 block normal-case font-medium">Backend may be waking up (may take up to a minute)</span>
                        </span>
                    </div>
                </div>
            )}
            <details className="absolute top-4 right-4 z-20 bg-[#121318]/95 border border-[#22232a]/80 rounded-xl p-3.5 text-xs text-gray-400 w-[240px] shadow-lg group [&_summary::-webkit-details-marker]:hidden">
                <summary className="font-bold text-white uppercase tracking-wider text-[10px] cursor-pointer list-none flex items-center justify-between outline-none select-none">
                    <span>Demo Credentials</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 transform group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="space-y-3.5 font-mono mt-3 border-t border-[#22232a]/50 pt-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Manager</span>
                        <div className="flex justify-between text-xs">
                            <span className="text-white">User: <strong className="text-emerald-500">ethanm</strong></span>
                            <span>PIN: <strong className="text-emerald-500">1234</strong></span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Waiter</span>
                        <div className="flex justify-between text-xs">
                            <span className="text-white">User: <strong className="text-emerald-500">sarahw</strong></span>
                            <span>PIN: <strong className="text-emerald-500">5678</strong></span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Chef</span>
                        <div className="flex justify-between text-xs">
                            <span className="text-white">User: <strong className="text-emerald-500">charlesc</strong></span>
                            <span>PIN: <strong className="text-emerald-500">4321</strong></span>
                        </div>
                    </div>
                </div>
            </details>

            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121318]/90 border border-[#22232a]/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 mb-4 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
                        SERVICE<span className="text-emerald-500">STACK</span>
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-bold">
                        Restaurant Management System
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="e.g. waiter, manager, chef"
                            className="w-full px-4 py-3.5 rounded-xl bg-[#1c1d24] border border-[#2d2e38] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Role
                        </label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={handleRoleChange}
                                className="w-full px-4 py-3.5 rounded-xl bg-[#1c1d24] border border-[#2d2e38] text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-300 cursor-pointer"
                            >
                                <option value="Waiter">Staff / Waiter</option>
                                <option value="Manager">Manager</option>
                                <option value="Chef">Kitchen / Chef</option>
                            </select>

                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                            Enter 4-Digit Passcode
                        </label>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            {pin.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={pinRefs[idx]}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, idx)}
                                    onKeyDown={(e) => handlePinKeyDown(e, idx)}
                                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold text-white rounded-xl bg-[#1c1d24] border border-[#2d2e38] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 uppercase shadow-inner"
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
