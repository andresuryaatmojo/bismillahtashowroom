import React from 'react';
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { NavMenu } from "./NavMenu";

export const NavigationSheet: React.FC = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Drawer</SheetTitle>
      </VisuallyHidden>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <NavMenu orientation="vertical" className="mt-12" />

        <div className="mt-8 space-y-4">
          <Button variant="outline" className="w-full sm:hidden">
            Masuk
          </Button>
          <Button className="w-full xs:hidden">Hubungi Kami</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};