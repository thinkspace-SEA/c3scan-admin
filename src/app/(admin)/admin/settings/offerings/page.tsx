export default function OfferingsSettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Offerings</h1>
        <p className="text-gray-500 mt-1">Manage mailbox plans and pricing</p>
      </div>
      
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Mailbox offering plans will be configurable here. For now, plans are managed directly in the database.
        </p>
      </div>
    </div>
  )
}
