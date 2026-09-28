const notFound = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-3xl font-bold">Product Not Found</h2>

      <p className="text-gray-500">
        The product you are looking for does not exist.
      </p>
    </div>
  );
};

export default notFound;
