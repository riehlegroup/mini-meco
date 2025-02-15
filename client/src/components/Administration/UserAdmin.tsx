import "./UserAdmin.css"

import { useState } from 'react';

import ReturnButton from "../Components/return";
import Table from "../Components/Table";

import Edit from "./../../assets/Edit.png";
import EmailIcon from "./../../assets/EmailIcon.png";

import { Email } from '../../../../server/src/email';

const userStatus = ["unconfirmed", "confirmed", "suspended", "removed"];

interface User {
    id: number;
    email: Email;
    name: string;
    githubUsername: string | null;
    status: string;
    password: string;
    userRole: string;
}

function checkError(response: Response) {
    if (response.status >= 200 && response.status <= 299) {
        return response;
    } else {
        throw Error(response.statusText);
    }
}

function UserEdit({ user, onClose }: { user: User; onClose: (update: boolean) => void }) {
    const [email, setEmail] = useState<Email>(user.email);
    const [githubUsername, setGithubUsername] = useState<string>(user.githubUsername || "");
    const [status, setStatus] = useState<string>(user.status);
    const [password, setPassword] = useState<string>();
    const [userRole, setUserRole] = useState<string>(user.userRole);

    function onSave() {
        const promises = []
        if (githubUsername && githubUsername !== user.githubUsername) {
            promises.push(fetch(`http://localhost:3000/user/githubUsername`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "userEmail": user.email.toString(), "newGithubUsername": githubUsername })
                })
                .then(checkError)
                .catch(console.error));
        }
        if (status !== user.status) {
            promises.push(fetch(`http://localhost:3000/updateUserStatus`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "userEmail": user.email.toString(), "status": status })
                })
                .then(checkError)
                .catch(console.error));
        }
        if (password) {
            promises.push(fetch(`http://localhost:3000/user/password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "userEmail": user.email.toString(), "password": password })
                })
                .then(checkError)
                .catch(console.error));
        }
        if (userRole !== user.userRole) {
            promises.push(fetch(`http://localhost:3000/user/role`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "email": user.email, "role": userRole })
                })
                .then(checkError)
                .catch(console.error));
        }

        Promise.all(promises).then(() =>
            email.toString() !== user.email.toString() ?
                fetch(`http://localhost:3000/user/mail`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ "newEmail": email.toString(), "oldEmail": user.email.toString() })
                    })
                    .then(checkError)
                    .catch(console.error) : null).then(() => onClose(true));
    }

    function onCancel() {
        onClose(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex size-full items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 text-left">
            <div className="relative max-h-full w-full max-w-2xl p-4">
                <div className="relative rounded-lg bg-white shadow">
                    <div className="flex items-center justify-between rounded-t border-b p-5">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Edit user
                        </h3>
                    </div>
                    <div className="space-y-4 p-5">
                        <form onSubmit={onSave}>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">Username</label>
                                <input value={user.name} disabled={true} className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500" />
                            </div>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">Email</label>
                                <input type="email" value={email.toString()} onChange={e => setEmail(new Email(e.target.value))} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
                            </div>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">GitHub Username</label>
                                <input value={githubUsername} onChange={e => setGithubUsername(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
                            </div>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900">
                                    <option>unconfirmed</option>
                                    <option>confirmed</option>
                                    <option>suspended</option>
                                    <option>removed</option>
                                </select>
                            </div>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">UserRole</label>
                                <input value={userRole} onChange={e => setUserRole(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
                            </div>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-900">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
                            </div>
                        </form>
                    </div>
                    <div className="flex items-center rounded-b border-t border-gray-200 p-5">
                        <button onClick={onSave} className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800">Save</button>
                        <button onClick={onCancel} className="ms-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const UserAdmin = () => {
    const [users, setUsers] = useState<Array<User>>([]);
    const [editing, setEditing] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function fetchUsers() {
        setLoading(true);
        fetch(`http://localhost:3000/getUsers`, { method: "GET", headers: { "Content-Type": "application/json" }, })
            .then(checkError)
            .then((response: Response) => response.json())
            .then((us: Array<User>) => setUsers(us))
            .then(() => setLoading(false))
            .catch(console.error);
    }

    function sendConfirmationEmail(user: User) {
        fetch(`/user/confirmation/trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: user.email.toString() }),
        })
          .then(checkError)
          .catch(console.error);
    }

    const tableData = users.map(user => [
        user.name,
        user.email.toString(),
        user.githubUsername ? user.githubUsername : "N/A",
        user.status,
        user.userRole,
        <div key={user.id} className="flex flex-row gap-3">
            <img className="h-5" src={Edit} title="edit" onClick={() => setEditing(user)}></img>
            {user.status === "unconfirmed" && <img className="h-5" src={EmailIcon} title="send confirmation email" onClick={() => sendConfirmationEmail(user)}></img>}
        </div>
    ]);

    return (
        <>
            <ReturnButton />
            <div className="DashboardContainer">
                <h1>User Admin</h1>
            </div>
            <div className="BigContainerUserAdmin">
                <Table
                    headings={["username", "email", "github username", "status", "userRole", "action"]}
                    loading={loading}
                    loadData={fetchUsers}
                    data={tableData}
                    rowsPerPage={9}
                    filterOptions={{ key: 3, options: userStatus }}
                />
            </div>
            {editing !== null && <UserEdit user={editing} onClose={(update) => { setEditing(null); if(update) fetchUsers(); }} />}
        </>
    );
}

export default UserAdmin;
