export function Card({ children, className = "" }) {
  return <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>{children}</div>
}

export function CardHeader({ children, className = "" }) {
  return <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold text-gray-800 dark:text-white ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }) {
  return <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

