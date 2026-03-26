import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile } from "../hooks/useQueries";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: profile } = useCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = loginStatus === "success" && identity;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/marketplace", label: "Marketplace" },
    ...(isLoggedIn
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/profile", label: "Profile" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-display font-bold tracking-tight">
            LendChain
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Auth */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.name || "User"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clear()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              size="sm"
            >
              {loginStatus === "logging-in" ? "Connecting..." : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
                    activeProps={{ className: "text-foreground font-semibold" }}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  {isLoggedIn ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">
                        {profile?.name || "User"}
                      </div>
                      <Button
                        onClick={() => {
                          clear();
                          setMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        login();
                        setMobileMenuOpen(false);
                      }}
                      disabled={loginStatus === "logging-in"}
                      className="w-full"
                    >
                      {loginStatus === "logging-in" ? "Connecting..." : "Login"}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
