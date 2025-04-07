export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="animate-spin h-8 w-8 border-4 border-custom-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
