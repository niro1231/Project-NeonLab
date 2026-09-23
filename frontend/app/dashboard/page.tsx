'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/api';
import type { User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const user = await api<User>('/auth/me');
      const allUsers = await api<User[]>('/users');

      setCurrentUser(user);
      setUsers(allUsers);

      setName(user.name);
      setEmail(user.email);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard.',
      );

      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await api<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          email,
        }),
      });

      setCurrentUser(updatedUser);

      setName(updatedUser.name);
      setEmail(updatedUser.email);

      setMessage('Profile updated successfully.');

      const allUsers = await api<User[]>('/users');
      setUsers(allUsers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await api('/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/login');
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await api('/users/me', {
        method: 'DELETE',
      });

      router.push('/register');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete account.',
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            User Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              My Profile
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Update your account information.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>

            <div className="mt-8 border-t pt-6">
              <button
                onClick={handleDeleteAccount}
                className="w-full rounded-lg border border-red-300 px-4 py-3 font-medium text-red-600 hover:bg-red-50"
              >
                Delete My Account
              </button>
            </div>
          </section>

          {/* Current user */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              Account Details
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Your currently logged-in account.
            </p>

            {currentUser && (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {currentUser.email}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="mt-1 break-all text-sm text-gray-700">
                    {currentUser.id}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Users */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-1 text-xl font-bold text-gray-900">
            Users
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Users registered in the system.
          </p>

          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">ID</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {user.name}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="max-w-xs truncate px-4 py-4 text-sm text-gray-500">
                        {user.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}