import './redesign.css'
import Navbar from './Navbar'
import MarketingFooter from './MarketingFooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-body">
      <Navbar />
      <main>
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
