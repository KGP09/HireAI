import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Calendar,
  Mic,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { cn } from "../lib/utils";
import { NavLink } from "../components/NavLink";
import { useAuthStore } from "../store/useAuthStore";

const navLinks = [
  { to: "/create", label: "Create", icon: Sparkles },
  { to: "/interviews", label: "Interviews", icon: MessageCircle },
  { to: "/speech-practice", label: "Speech", icon: Mic },
  { to: "/history", label: "History", icon: Clock },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authUser, logout } = useAuthStore();

  const displayName = authUser?.username || authUser?.email || "Guest";
  const displayEmail = authUser?.email || "";
  const avatarInitials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors" />
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">
              Hire<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/40 bg-background/80 px-1 py-1 shadow-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-muted-foreground transition-all duration-200"
                activeClassName="bg-primary/10 text-primary"
                pendingClassName="opacity-70"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={authUser?.profilePic || undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start max-w-[160px]">
                    <span className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </span>
                    {displayEmail && (
                      <span className="text-xs text-muted-foreground truncate">
                        {displayEmail}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{displayName}</span>
                    {displayEmail && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {displayEmail}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={async () => {
                    await logout();
                    navigate("/login");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                      <Brain className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      Hire<span className="text-primary">AI</span>
                    </span>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          )}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="border-t border-border pt-4">
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                    <button
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
                      onClick={async () => {
                        await logout();
                        setMobileOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Log out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
