import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Shield, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome back!</h1>
            <a href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Go to Dashboard</a>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MIRA Portal</h1>
              <p className="text-gray-600 mb-8">
                Management & Incident Reporting Application
                <br />
                Secure access to your dashboard
              </p>
              <SignInButton mode="modal">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <span>Sign In to Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SignInButton>
              <p className="text-xs text-gray-500 mt-6">
                Authorized personnel only. All activities are monitored and logged.
              </p>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}