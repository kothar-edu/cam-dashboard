type PlaceholderPageProps = {
  title?: string;
};

export default function PlaceholderPage({ title = 'Coming soon' }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-12 text-center">
      <h2 className="text-xl font-semibold text-[#12233D]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This section will be rebuilt in the next dashboard revamp phase with tenant-aware
        data tables and forms.
      </p>
    </div>
  );
}
