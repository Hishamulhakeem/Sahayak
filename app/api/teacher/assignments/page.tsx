import { Navigation } from '@/components/navigation'
import { Plus, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TeacherAssignmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const userId = (session.user as any).id

  const assignments = await prisma.contentGeneration.findMany({
    where: {
      type: 'worksheet',
      teacherId: userId
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assignments</h1>
          <Link href="/teacher/lessons/new" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-indigo-700 flex items-center text-sm">
            <Plus className="w-4 h-4 mr-1"/> Create Assignment
          </Link>
        </div>

        <div className="grid gap-6">
          {assignments.length === 0 && (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500">
              No assignments created yet. Click 'Create Assignment' to generate a new worksheet.
            </div>
          )}
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-indigo-300 transition-colors border-l-4 border-l-indigo-500">
              <div className="flex space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{assignment.className} • {assignment.subject} • {assignment.topic}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  assignment.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {assignment.status}
                </span>
                <Link href={`/teacher/dashboard`} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
