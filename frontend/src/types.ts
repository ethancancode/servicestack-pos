export interface MenuItem<> {
    id: string;
    name: string;
    price: number;
    category: string;
}

export interface OrderItem<> {
    id: string;
    item: MenuItem;
    quantity: number;
    status: "ordered" | "cooking" | "ready" | "served";
}

export interface Order<> {
    id: string;
    table: number;
    status: "open" | "paid" | "voided";
    items: OrderItem[];
}

export type OrderAction<> =
    | { type: "ADD_ITEM"; payload: MenuItem; tableID: number }
    | { type: "REMOVE_ITEM"; payload: string; tableID: number }
    | { type: "CHANGE_STATUS"; payload: "open" | "paid" | "voided"; tableID: number }
    | { type: "CLEAR_ORDER"; tableID: number }
    | { type: "DECREMENT_ITEM"; payload: string; tableID: number }
    | { type: "CLOSE_ORDER"; tableID: number }
    | { type: "SEND_TO_KITCHEN"; tableID: number };
