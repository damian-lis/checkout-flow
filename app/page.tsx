import { ClientComponent, ServerComponent } from "@/components";

export default function Home() {
  return (
    <main className="p-24">
      <div className="text-center">
        <ClientComponent />
        <ServerComponent />
      </div>
    </main>
  );
}
