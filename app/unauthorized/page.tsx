import React from 'react'
import Link from 'next/link'

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 py-8 md:py-10">
            <h1 className="text-2xl font-bold">401 Unauthorized</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this resource.</p>
            
            <div className="flex gap-4">
                <Link href="/" className="px-4 py-2 bg-yellow-400 rounded-md hover:bg-yellow-500 text-black">
                    Back to Home
                </Link>
                <Link href="/admin/login" className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 text-white">
                    Admin Login
                </Link>
            </div>
        </div>
    )
}