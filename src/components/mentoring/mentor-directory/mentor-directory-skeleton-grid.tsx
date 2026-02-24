export default function MentorDirectorySkeletonGrid() {
  return (
    <div className="grid grid-cols-1 items-start gap-250 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-200 bg-background-alternative h-[480px] animate-pulse"
        />
      ))}
    </div>
  );
}
