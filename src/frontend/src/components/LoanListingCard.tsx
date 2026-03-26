import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Shield, TrendingUp } from "lucide-react";
import type { LoanListing } from "../backend";
import {
  ASSET_SYMBOLS,
  formatBigInt,
  formatPercentage,
  formatDuration,
  getTrustScorePercentage,
  getTrustScoreColor,
} from "../utils/formatters";
import { useUserProfile, useCreateLoanAgreement } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LoanListingCardProps {
  listing: LoanListing;
}

export default function LoanListingCard({ listing }: LoanListingCardProps) {
  const { identity } = useInternetIdentity();
  const { data: lenderProfile } = useUserProfile(listing.lender);
  const createAgreement = useCreateLoanAgreement();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const trustScorePercent = getTrustScorePercentage(listing.minTrustScore);
  const lenderTrustScorePercent = lenderProfile
    ? getTrustScorePercentage(lenderProfile.trustScore)
    : 0;

  const handleAccept = async () => {
    if (!identity) {
      toast.error("Please login to accept this offer");
      return;
    }

    try {
      await createAgreement.mutateAsync({
        lender: listing.lender,
        borrower: identity.getPrincipal(),
        assetType: listing.assetType,
        amount: listing.amount,
        interestRate: listing.interestRate,
        durationDays: listing.durationDays,
        collateralType: listing.collateralType,
        collateralAmount: listing.collateralAmount,
      });
      toast.success("Loan agreement created successfully!");
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to create loan agreement");
      console.error(error);
    }
  };

  const isOwnListing = identity?.getPrincipal().toString() === listing.lender.toString();

  return (
    <>
      <Card className="flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-2xl font-display">
              {formatBigInt(listing.amount, 0)} {ASSET_SYMBOLS[listing.assetType]}
            </CardTitle>
            <Badge variant="outline" className="text-success border-success">
              {formatPercentage(listing.interestRate)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(listing.durationDays)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          {/* Collateral */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Collateral Required
            </div>
            <div className="text-sm font-semibold">
              {formatBigInt(listing.collateralAmount, 0)} {ASSET_SYMBOLS[listing.collateralType]}
            </div>
          </div>

          {/* Lender Trust Score */}
          {lenderProfile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lender Trust</span>
                <span className={`font-semibold ${getTrustScoreColor(lenderProfile.trustScore)}`}>
                  {Number(lenderProfile.trustScore)}/1000
                </span>
              </div>
              <Progress value={lenderTrustScorePercent} className="h-2" />
              <Badge className="text-xs">{lenderProfile.reputation}</Badge>
            </div>
          )}

          {/* Min Trust Score Required */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Min Trust Required</span>
              <span className="font-semibold">{Number(listing.minTrustScore)}/1000</span>
            </div>
            <Progress value={trustScorePercent} className="h-2" />
          </div>
        </CardContent>

        <CardFooter>
          {isOwnListing ? (
            <Button variant="outline" disabled className="w-full">
              Your Listing
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!identity || createAgreement.isPending}
              className="w-full"
            >
              {createAgreement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Accept Offer
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Loan Agreement</DialogTitle>
            <DialogDescription>
              You are about to borrow {formatBigInt(listing.amount, 0)}{" "}
              {ASSET_SYMBOLS[listing.assetType]} at {formatPercentage(listing.interestRate)}{" "}
              interest for {formatDuration(listing.durationDays)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collateral:</span>
              <span className="font-semibold">
                {formatBigInt(listing.collateralAmount, 0)} {ASSET_SYMBOLS[listing.collateralType]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold">{formatDuration(listing.durationDays)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-semibold">{formatPercentage(listing.interestRate)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={createAgreement.isPending}>
              {createAgreement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm Agreement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
