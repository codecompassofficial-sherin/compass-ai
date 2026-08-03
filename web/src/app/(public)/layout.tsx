import { Logo } from '@/components/common/logo'
import { PageContainer } from '@/components/common/page-container'
import { ThemeToggle } from '@/components/navigation/theme-toggle'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center border-b px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <Logo />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <PageContainer>{children}</PageContainer>
      </main>
      <footer className="border-t py-6">
        <PageContainer>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Compass AI
          </p>
        </PageContainer>
      </footer>
    </div>
  )
}
