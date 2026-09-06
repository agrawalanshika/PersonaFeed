export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        Personalized Content Dashboard
      </h1>
      <p className="max-w-md text-sm text-neutral-500">
        Phase 1 complete: project tooling is initialized. The real dashboard
        shell arrives in Phase 2.
      </p>
      <ul className="text-left text-sm text-neutral-600 dark:text-neutral-300">
        <li>Next.js + TypeScript + Tailwind CSS</li>
        <li>Redux Toolkit + React Redux</li>
        <li>Framer Motion</li>
        <li>dnd-kit</li>
        <li>lucide-react</li>
        <li>ESLint</li>
      </ul>
    </main>
  );
}
