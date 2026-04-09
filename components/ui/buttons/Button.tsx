type ButtonProps = {
    children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900">
      {children}
    </button>
  );
}