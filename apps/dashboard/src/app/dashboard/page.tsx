import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        
        </div>
        <div className="grid gap-6">
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Bienvenido al Dashboard</h2>
            <p className="text-muted-foreground">
              Has iniciado sesión correctamente. Aquí puedes gestionar tu cuenta y ver tus datos.
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Información de la sesión</h3>
            <p className="text-sm text-muted-foreground">
              Token: {token.value.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
