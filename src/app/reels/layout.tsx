

export default function ReelsLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    // We don't use AppLayout here to have a fully immersive experience
    return (
        <div className="h-screen w-full flex items-center justify-center p-0 sm:p-4 bg-background">
             <div className="h-full w-full max-w-md mx-auto aspect-[9/16] relative">
                {children}
             </div>
        </div>
    )
  }
