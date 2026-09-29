import Link from "next/link";
import CartCount from "./CartCount";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="flex flex-col items-center justify-between bg-gray-900 px-6 py-3 text-white lg:flex-row">
      <h1 className="text-xl font-bold">{title}</h1>
      <nav className="flex items-center gap-6">
        <Link className="hover:text-blue-400" href="/">
          Home
        </Link>
        <Link className="hover:text-blue-400" href="/products">
          Products
        </Link>
        <Link
          className="hover:text-blue-400 flex items-center gap-1.5"
          href="/cart"
        >
          Cart
          <CartCount />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
