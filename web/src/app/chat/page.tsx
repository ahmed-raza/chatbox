"use client";

import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
    id: number;
    text: string;
    sender: string;
}

function ChatPageContent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const { user } = useAuth();
    const conversation_id = "cmddfr2dc0000myimcjasyi64"

    const fetchMessages = async () => {
        try {
            let auth_token = '';
            const token = localStorage.getItem('auth_tokens')
            if (token) {
                auth_token = JSON.parse(token).access_token
                console.log(auth_token)
            } else {
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/chat/messages/${conversation_id}`, {
                headers: {
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    useEffect(() => {
        if (!user?.id) return;
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/${conversation_id}?user_id=${user?.id}`);

        ws.current.onmessage = (event) => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now(), text: event.data, sender: "they" },
            ]);
        };

        ws.current.onclose = () => { console.log("Disconnected") }
        return () => ws.current?.close()
    }, [user?.id]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setInput("");

        ws?.current?.send(input);

        setMessages((prev) => [
            ...(prev || []),
            { id: Date.now() + 1, text: input, sender: "me" },
        ]);
    };

    const handleRefresh = () => {
        fetchMessages();
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto bg-white border rounded-md shadow mt-4">
            {/* Chat Header */}
            <div className="border-b p-4 bg-gray-50">
                <h1 className="text-lg font-semibold text-gray-900">
                    Welcome, {user?.name || user?.email}!
                </h1>
                <p className="text-sm text-gray-600">Chat with other users</p>
                <button className="text-gray-600 border-amber-300 bg-amber-500 p-6" onClick={handleRefresh}>Refresh</button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 && messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.sender === "me"
                        ? "ml-auto bg-blue-500 text-white"
                        : "mr-auto bg-gray-200 text-gray-800"
                    }`}
                >
                    {msg.text}
                </div>
                ))}
                <div ref={bottomRef} />
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

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <ChatPageContent />
        </ProtectedRoute>
    );
}
