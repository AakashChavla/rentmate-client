import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight text-primary">
            {env.NEXT_PUBLIC_APP_NAME}
          </p>
          <p className="text-sm text-muted-foreground">
            Hotels, PGs, hostels, apartments, and rental flats.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
