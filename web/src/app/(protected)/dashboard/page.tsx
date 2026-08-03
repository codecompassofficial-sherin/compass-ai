import { LayoutDashboard } from 'lucide-react'

import { PageContainer } from '@/components/common/page-container'
import { SectionHeader } from '@/components/common/section-header'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const modules = [
  {
    title: 'Assessment',
    description: 'Your readiness snapshot will appear here.',
  },
  { title: 'Roadmap', description: 'Your career roadmap will appear here.' },
  { title: 'Goals', description: 'Your goals and projects will appear here.' },
]

export default function DashboardPage() {
  return (
    <PageContainer>
      <SectionHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="An overview of your career plan."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ title, description }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {title}
                <Badge variant="outline" className="text-[10px]">
                  Soon
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No data yet"
                description={description}
                className="border-none px-0 py-8"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
