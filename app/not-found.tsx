import NotFoundState from "./components/NotFoundState";

const NotFound = () => {
  return (
    <NotFoundState
      heading="Page not found"
      message="The page you are looking for doesn't exist."
      ctaHref="/"
    />
  );
};

export default NotFound;
