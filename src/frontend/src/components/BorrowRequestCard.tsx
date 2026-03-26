import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Shield, HandshakeIcon } from "lucide-react";
import type { BorrowRequest } from "../backend";
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

interface BorrowRequestCardProps {
  request: BorrowRequest;
}

export default function BorrowRequestCard({ request }: BorrowRequestCardProps) {
  const { identity } = useInternetIdentity();
  const { data: borrowerProfile } = useUserProfile(request.borrower);
  const createAgreement = useCreateLoanAgreement();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const borrowerTrustScorePercent = borrowerProfile
    ? getTrustScorePercentage(borrowerProfile.trustScore)
    : 0;

  const handleMatch = async () => {
    if (!identity) {
      toast.error("Please login to match this request");
      return;
    }

    try {
      await createAgreement.mutateAsync({
        lender: identity.getPrincipal(),
        borrower: request.borrower,
        assetType: request.assetType,
        amount: request.amount,
        interestRate: request.offeredInterestRate,
        durationDays: request.durationDays,
        collateralType: request.collateralType,
        collateralAmount: request.collateralAmount,
      });
      toast.success("Loan agreement created successfully!");
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to create loan agreement");
      console.error(error);
    }
  };

  const isOwnRequest = identity?.getPrincipal().toString() === request.borrower.toString();

  return (
    <>
      <Card className="flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-2xl font-display">
              {formatBigInt(request.amount, 0)} {ASSET_SYMBOLS[request.assetType]}
            </CardTitle>
            <Badge variant="outline" className="text-warning border-warning">
              {formatPercentage(request.offeredInterestRate)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(request.durationDays)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          {/* Collateral */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Collateral Offered
            </div>
            <div className="text-sm font-semibold">
              {formatBigInt(request.collateralAmount, 0)} {ASSET_SYMBOLS[request.collateralType]}
            </div>
          </div>

          {/* Borrower Trust Score */}
          {borrowerProfile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Borrower Trust</span>
                <span
                  className={`font-semibold ${getTrustScoreColor(borrowerProfile.trustScore)}`}
                >
                  {Number(borrowerProfile.trustScore)}/1000
                </span>
              </div>
              <Progress value={borrowerTrustScorePercent} className="h-2" />
              <Badge className="text-xs">{borrowerProfile.reputation}</Badge>
            </div>
          )}

          {/* Stats */}
          {borrowerProfile && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-muted/30 p-2">
                <div className="text-muted-foreground">Loans Taken</div>
                <div className="font-semibold">{Number(borrowerProfile.loansTaken)}</div>
              </div>
              <div className="rounded bg-muted/30 p-2">
                <div className="text-muted-foreground">Completed</div>
                <div className="font-semibold">{Number(borrowerProfile.successfulCompletions)}</div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {isOwnRequest ? (
            <Button variant="outline" disabled className="w-full">
              Your Request
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
                  <HandshakeIcon className="mr-2 h-4 w-4" />
                  Match Request
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
              You are about to lend {formatBigInt(request.amount, 0)}{" "}
              {ASSET_SYMBOLS[request.assetType]} at {formatPercentage(request.offeredInterestRate)}{" "}
              interest for {formatDuration(request.durationDays)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collateral:</span>
              <span className="font-semibold">
                {formatBigInt(request.collateralAmount, 0)} {ASSET_SYMBOLS[request.collateralType]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold">{formatDuration(request.durationDays)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-semibold">{formatPercentage(request.offeredInterestRate)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMatch} disabled={createAgreement.isPending}>
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
