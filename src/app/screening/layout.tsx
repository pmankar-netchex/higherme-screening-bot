import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Screening - Restaurant Recruitment Platform',
  description: 'Automated screening for restaurant job applications',
}

export default function ScreeningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-gray-50">
      {children}
    </section>
  )
}
