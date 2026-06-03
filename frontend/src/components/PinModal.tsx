import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

interface PinModalProps {
    onClose: () => void;
    onConfirm: () => void;
    correctPin: string;
}

export function PinModal({ onClose, onConfirm, correctPin }: PinModalProps) {
    const [pin, setPin] = useState("");

    const { showToast } = useToast();
    const handleOK = () => {
        if (pin === correctPin) {
            onConfirm();
        } else {
            showToast("Incorrect PIN!", "error");
            setPin("");
        }
    }

    const handleKeypad = (num: string) => {
        if (pin.length < 4) setPin(prev => prev + num);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (/^[0-9]$/.test(e.key)) {
                handleKeypad(e.key);
            }
            if (e.key === "Enter") {
                e.preventDefault();
                handleOK();
            }
            if (e.key === "Backspace" || e.key === "Escape") {
                setPin("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pin]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1b1f] border border-[#2a2b2f] rounded-2xl w-full max-w-xs p-6 shadow-2xl">
                <h3 className="text-white text-center font-bold mb-4 uppercase tracking-widest text-sm">Manager Authorization</h3>

                {/* PIN Display */}
                <div className="flex justify-center gap-3 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full border ${pin.length > i ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`} />
                    ))}
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "OK"].map((key) => (
                        <button
                            key={key}
                            onClick={() => {
                                if (key === "CLR") setPin("");
                                else if (key === "OK") handleOK();
                                else handleKeypad(key);
                            }}
                            className="h-14 rounded-xl bg-[#222326] text-white font-bold hover:bg-[#2a2b2f] transition-colors"
                        >
                            {key}
                        </button>
                    ))}
                </div>

                <button onClick={onClose} className="w-full text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
}
