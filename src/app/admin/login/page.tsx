import { MeshBackground } from "@/components/background/mesh-background";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Accesso" };

export default function LoginPage() {
  return (
    <>
      <MeshBackground />
      <main className="grid min-h-dvh place-items-center px-4">
        <LoginForm />
      </main>
    </>
  );
}
