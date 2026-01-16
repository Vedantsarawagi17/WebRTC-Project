export const ChatLoading = () => {
  // Create an array of 12 items to map over
  const skeletonRows = Array.from({ length: 12 });
// Dummy Array ->
// Array.from({ length: 12 }) creates a new array with 12 empty slots.
// We don't care about the data in this array; we just need something to loop over 12 times so we can render 12 loading bars.

  return (
    <div className="flex flex-col space-y-2 w-full">
      {skeletonRows.map((_, index) => (
        <div
          key={index}
          className="h-12 w-full bg-gray-200 rounded-md animate-pulse"
        ></div>
      ))}
    </div>
  );
};

// ChatLoading is a Skeleton Screen for users until data is fetched .