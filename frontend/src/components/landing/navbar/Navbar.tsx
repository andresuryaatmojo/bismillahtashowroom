import React from 'react';
import { Button } from "../../ui/button";
import { Logo } from "./Logo";
import { NavMenu } from "./NavMenu";
import { NavigationSheet } from "./NavigationSheet";
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="h-16 bg-white border-b border-gray-200">
      <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Masuk</Link>
          </Button>
          <Button className="hidden xs:inline-flex" asChild>
            <Link to="/register">Hubungi Kami</Link>
          </Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;