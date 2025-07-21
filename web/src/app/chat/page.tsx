"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
    id: number;
    text: string;
    sender: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");

    useEffect(() => {
        ws.current = new WebSocket("ws://127.0.0.1:8000/ws/1");

        ws.current.onmessage = (event) => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now(), text: event.data, sender: "bot" },
            ]);
        };

        ws.current.onclose = () => { console.log("Disconnected") }
        return () => ws.current?.close()
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        setInput("");

        ws?.current?.send(input);

        setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, text: input, sender: "user" },
        ]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto bg-white border rounded-md shadow mt-4">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200 text-gray-800"
                }`}
            >
                {msg.text}
            </div>
            ))}
        </div>

        {/* Input box */}
        <div className="border-t p-4 flex items-center gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
            Send
            </button>
        </div>
        </div>
    );
}
