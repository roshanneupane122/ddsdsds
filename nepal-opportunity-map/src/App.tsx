import { Outlet, useLocation } from 'react-router-dom'
import { Header, Sidebar, PageContainer, Footer } from '@/components/layout'
import { ToastContainer } from '@/components/ui'
import { AiAnalystChat } from '@/features/chat/AiAnalystChat'

export default function App() {
  const location = useLocation()

  const isDashboardRoute =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/dashboard/') ||
    location.pathname === '/citizen/dashboard' ||
    location.pathname.startsWith('/citizen/') ||
    location.pathname === '/admin/dashboard' ||
    location.pathname.startsWith('/admin/')

  return (
    <div className="min-h-screen bg-[#F4FBF7] text-slate-800 font-body flex flex-col antialiased">
      {isDashboardRoute ? (
        <>
          <Header />
          <Sidebar />
          <div className="flex-1">
            <PageContainer>
              <Outlet />
            </PageContainer>
          </div>
          <Footer />
        </>
      ) : (
        <div className="flex-1">
          <Outlet />
        </div>
      )}
      <AiAnalystChat />
      <ToastContainer />
    </div>
  )
}
