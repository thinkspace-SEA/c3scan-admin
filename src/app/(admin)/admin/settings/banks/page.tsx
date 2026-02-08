export default function BanksSettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Banks</h1>
        <p className="text-gray-500 mt-1">Manage bank institutions for deposit requests</p>
      </div>
      
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Bank institution management will be available here. For now, banks are configured directly in the database.
        </p>
      </div>
    </div>
  )
}
