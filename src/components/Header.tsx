import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trophy, User, LogOut, Shield, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeason } from "@/hooks/useSeasons";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { seasonId } = useParams<{ seasonId: string }>();
  const { data: season } = useSeason(seasonId);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("signedOutSuccessfully"));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">{t("football")}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {season?.name ?? t("resultsSystem")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {seasonId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                title={t("changeSeason")}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </Button>
            )}
            <LanguageSwitcher />
            {!loading && (
              <>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate("/admin/users")} 
                    title={t("adminPanel")}
                  >
                    <Shield className="w-5 h-5 text-primary" />
                  </Button>
                )}
                {user ? (
                  <Button variant="ghost" size="icon" onClick={handleSignOut} title={t("signOut")}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setAuthOpen(true)} title={t("signIn")}>
                    <User className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Header;
