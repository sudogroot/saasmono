"use client"

export interface RaqeemMainContainerProps {
  children: React.ReactNode;
  breadcrumbs: Record<string, string>;
  pathname: string;
}

export function RaqeemMainContainer({
  children,
  breadcrumbs,
  pathname
}: RaqeemMainContainerProps) {
  return (
    <>
      <div className="border-b hidden sm:block bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {breadcrumbs[pathname]}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container sm:mx-auto sm:p-6 p-0">
        {children}
      </div>
    </>
  )
}