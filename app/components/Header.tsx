import Link from "next/link";
import CartCount from "./CartCount";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 px-6 py-3 text-white backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>

        <nav className="flex items-center gap-6">
          <Link className="hover:text-blue-400" href="/">
            Home
          </Link>
          <Link className="hover:text-blue-400" href="/products">
            Products
          </Link>
          <Link
            className="flex items-center gap-1.5 hover:text-blue-400"
            href="/cart"
          >
            Cart
            <CartCount />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
