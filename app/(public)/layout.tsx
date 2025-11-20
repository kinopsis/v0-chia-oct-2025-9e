import { Header } from "@/components/header"
import { ConvocoreWidget } from "@/components/convocore-widget"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <ConvocoreWidget />
    </>
  )
}
