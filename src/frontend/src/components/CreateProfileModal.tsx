import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useCreateProfile } from "../hooks/useQueries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateProfileModal() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const createProfile = useCreateProfile();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  // Show modal when user is logged in but has no profile
  useEffect(() => {
    if (loginStatus === "success" && identity && !profileLoading && !profile) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [loginStatus, identity, profile, profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await createProfile.mutateAsync(name.trim());
      toast.success("Profile created successfully!");
      setName("");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            Welcome to LendChain
          </DialogTitle>
          <DialogDescription>
            Create your profile to start lending and borrowing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createProfile.isPending}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createProfile.isPending || !name.trim()}
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
