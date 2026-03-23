"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: "/", label: "Library" },
    { href: "/books/new", label: "Add New" },
  ];

  return (
    <header className="w-full fixe z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 md:px-0 flex justify-between items-center">
        <Link href="/" className="flex gap-1 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookfiled"
            width={42}
            height={42}
          />
          <span className="logo-text">Bookified</span>
        </Link>

        <nav className="flex gap-7.5 w-fit items-center">
          {navItems.map(({ href, label }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));

            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "text-black hover:opacity-70",
                )}
              >
                {" "}
                {label}{" "}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-7.5 text-blackalign-items-start">
          <Show when="signed-out" >
            <SignInButton mode="modal" />
            <SignUpButton />
          </Show>
          <Show when="signed-in">
            <div className="nav-user-link">
            <UserButton />
            {user?.firstName && (
                <Link href="/subscriptions" className="nav-user-name"> {user?.firstName} </Link>
            )} 
            </div>            
          </Show>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
