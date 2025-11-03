import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Leaf, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import ecoIcon from "@/assets/eco-icon.png";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={ecoIcon} alt="EcoRide" className="h-10 w-10 transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EcoRide Campus
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/rides">Rides</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/communities">Communities</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/rewards">Rewards</Link>
                </Button>
                <NotificationBell />
                <Button variant="ghost" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" asChild>
                  <Link to="/auth">
                    <Leaf className="mr-2 h-4 w-4" />
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
