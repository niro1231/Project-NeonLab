import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          User Management
        </h1>

        <p className="mb-8 text-gray-600">
          Simple user authentication and management system.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-black px-4 py-3 text-center font-medium text-white hover:bg-gray-800"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-medium text-gray-900 hover:bg-gray-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}