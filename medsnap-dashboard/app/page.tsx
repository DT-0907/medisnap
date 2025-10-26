import MedSnapWebsite from '@/components/osiris-website'
import SharedLayout from '@/components/shared-layout'

export default function Home() {
  return (
    <SharedLayout showNavigation={false}>
      <MedSnapWebsite />
    </SharedLayout>
  )
}
