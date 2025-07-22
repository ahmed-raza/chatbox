"use client"

import { useEffect, useState } from "react";

interface User {
    id: number;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            let auth_token = '';
            const token = localStorage.getItem('auth_tokens')
            if (token) {
                auth_token = JSON.parse(token).access_token
                console.log(auth_token)
            } else {
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/users', {
                headers: {
                    "Authorization": `Bearer ${auth_token}`
                }
            });
            const data = await response.json();
            console.log(data)
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefresh = () => {
        fetchUsers();
    }


  return (
    <>
        <h1 className="text-4xl font-bold">Users</h1>
        <button onClick={handleRefresh}>Refresh</button>
        <table className="w-full border-2 border-amber-100">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined On</th>
                </tr>
            </thead>
            <tbody>
                {users.length > 0 && users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.created_at}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
  );
}
