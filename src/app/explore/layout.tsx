
import AppLayout from "@/components/layout/app-layout";

export default function ExploreLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    )
  }
  
