import { Header } from "@/components/header"
import { ChatWidget } from "@/components/chat-widget"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <ChatWidget />
    </>
  )
}
