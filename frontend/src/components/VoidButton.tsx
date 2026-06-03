import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function VoidButton() {
    const user = useContext(AuthContext);
    const { showToast } = useToast();
    if (user?.role === "Manager") {
        showToast("Item voided successfully!", "success");
    } else {
        showToast("Access Denied: Please ask a Manager for a PIN code.", "error");
    }

    const handleVoidClick = () => {
        if (user?.role === "Manager") {
            alert("Item voided successfully!");
        } else {
            alert("Access Denied: Please ask a Manager for a PIN code.");
        }
    };

    return (
        <button
            onClick={handleVoidClick}
            style={{ padding: "10px", backgroundColor: "#ba1a1a", color: "white", borderRadius: "5px" }}
        >
            Void Item
        </button>
    );
}
