import Link from "next/link";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="flex flex-col items-center justify-between bg-gray-900 px-6 py-4 text-white lg:flex-row lg:items-center lg:justify-between">
      <h1>{title}</h1>
      <nav className="flex gap-4">
        <Link className="hover:text-blue-400" href="/">
          Home
        </Link>
        <Link className="hover:text-blue-400" href="/products">
          Products
        </Link>
        <Link className="hover:text-blue-400" href="/cart">
          Cart
        </Link>
      </nav>
    </header>
  );
};

export default Header;
