import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  autoHideDuration?: number
}

export function Notification({ 
  message, 
  type, 
  onClose, 
  autoHideDuration = 5000 
}: NotificationProps) {
  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(onClose, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [autoHideDuration, onClose])

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full">
      <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}>
        <div className="flex items-center">
          {type === 'success' && (
            <svg className="h-5 w-5 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex text-white hover:text-gray-100 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
} 