import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Trophy, User, LogOut, Shield, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeason, useSeasons } from "@/hooks/useSeasons";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seasonId } = useParams<{ seasonId: string }>();
  const { data: season } = useSeason(seasonId);
  const { data: seasons } = useSeasons();
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleSeasonChange = (newId: string) => {
    if (!newId || newId === seasonId) return;
    const match = location.pathname.match(/^\/s\/[^/]+(\/.*)?$/);
    const suffix = match?.[1] ?? "";
    navigate(`/s/${newId}${suffix}`);
  };

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
        <div className="container max-w-lg mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          {/* Logo: icon-only on mobile, full on desktop */}
          <button
            className="flex items-center gap-2 sm:gap-3 cursor-pointer text-left shrink-0"
            onClick={() => navigate("/")}
            title={t("home")}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg text-foreground leading-tight">{t("football")}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {season?.name ?? t("resultsSystem")}
              </p>
            </div>
          </button>

          {/* Season selector: compact on mobile */}
          {seasonId && seasons && seasons.length > 0 && (
            <div className="flex-1 min-w-0 flex justify-center">
              <Select value={seasonId} onValueChange={handleSeasonChange}>
                <SelectTrigger
                  className="h-9 w-full max-w-[10rem] sm:max-w-[12rem] gap-1.5 border-border/60 bg-background/60 px-2 text-xs font-medium"
                  title={t("changeSeason")}
                >
                  <SelectValue placeholder={season?.name ?? t("changeSeason")} />
                </SelectTrigger>
                <SelectContent align="end">
                  {seasons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
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

          {/* Mobile actions menu */}
          <div className="flex sm:hidden items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t("moreActions")}>
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setLanguage(language === "mk" ? "en" : "mk")}>
                  <img
                    src={language === "mk" ? "https://flagcdn.com/w40/gb.png" : "https://flagcdn.com/w40/mk.png"}
                    alt={language === "mk" ? "EN" : "MK"}
                    className="w-5 h-3 object-cover rounded-sm mr-2"
                  />
                  {language === "mk" ? "English" : "Македонски"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!loading && (
                  <>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin/users")}>
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        {t("adminPanel")}
                      </DropdownMenuItem>
                    )}
                    {user ? (
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("signOut")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setAuthOpen(true)}>
                        <User className="w-4 h-4 mr-2" />
                        {t("signIn")}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Header;
