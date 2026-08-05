import { Link } from 'react-router-dom'
import { Button, EmptyState } from '@/components/ui'

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        title="404 — Page Not Found"
        description="The geographic route or platform page you requested does not exist."
        action={
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        }
      />
    </div>
  )
}
