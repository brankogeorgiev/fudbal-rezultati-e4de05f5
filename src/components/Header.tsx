import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Trophy, User, LogOut, Shield, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/AuthDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SeasonDialog from "@/components/SeasonDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  useSeason,
  useSeasons,
  useCreateSeason,
  useUpdateSeason,
  useDeleteSeason,
  type Season,
} from "@/hooks/useSeasons";
import { toast } from "sonner";


const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seasonId } = useParams<{ seasonId: string }>();
  const { data: season } = useSeason(seasonId);
  const { data: seasons } = useSeasons();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Season | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Season | null>(null);
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();
  const deleteSeason = useDeleteSeason();


  const handleSeasonChange = (newId: string) => {
    if (!newId || newId === seasonId) return;
    const match = location.pathname.match(/^\/s\/[^/]+(\/.*)?$/);
    const suffix = match?.[1] ?? "";
    navigate(`/s/${newId}${suffix}`);
  };

  const handleSaveSeason = (data: { name: string; startDate: string; endDate: string }) => {
    if (editTarget) {
      updateSeason.mutate({ id: editTarget.id, ...data });
    } else {
      createSeason.mutate(data);
    }
  };

  const handleDeleteSeason = () => {
    if (!deleteTarget) return;
    const wasActive = deleteTarget.id === seasonId;
    deleteSeason.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (wasActive) navigate("/");
      },
    });
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
            {seasonId && seasons && seasons.length > 0 && (
              <Select value={seasonId} onValueChange={handleSeasonChange}>
                <SelectTrigger
                  className="h-9 w-auto gap-1.5 border-border/60 bg-background/60 px-2.5 text-xs font-medium"
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
            )}
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSeasonDialogMode("create");
                    setSeasonDialogOpen(true);
                  }}
                  title={t("newSeason")}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                {season && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSeasonDialogMode("edit");
                        setSeasonDialogOpen(true);
                      }}
                      title={t("editSeason")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteOpen(true)}
                      title={t("deleteSeason")}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </>
                )}
              </>
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
      <SeasonDialog
        open={seasonDialogOpen}
        onOpenChange={setSeasonDialogOpen}
        editSeason={seasonDialogMode === "edit" ? season ?? null : null}
        onSave={handleSaveSeason}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteSeason}
        title={t("deleteSeason")}
        description={t("deleteSeasonDescription")}
      />
    </>
  );
};

export default Header;
