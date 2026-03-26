import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBorrowRequest } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ASSET_OPTIONS, parseBigInt } from "../utils/formatters";
import { AssetType } from "../backend";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function CreateBorrowRequestPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createRequest = useCreateBorrowRequest();

  const [assetType, setAssetType] = useState<AssetType>(AssetType.btc);
  const [amount, setAmount] = useState("");
  const [offeredInterestRate, setOfferedInterestRate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [collateralType, setCollateralType] = useState<AssetType>(AssetType.eth);
  const [collateralAmount, setCollateralAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error("Please login to create a borrow request");
      return;
    }

    // Validation
    if (!assetType || !amount || !offeredInterestRate || !durationDays || !collateralType || !collateralAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    const interestRateNum = parseFloat(offeredInterestRate);
    const durationNum = parseInt(durationDays);
    const collateralNum = parseFloat(collateralAmount);

    if (amountNum <= 0 || interestRateNum < 0 || durationNum <= 0 || collateralNum <= 0) {
      toast.error("Please enter valid positive values");
      return;
    }

    try {
      await createRequest.mutateAsync({
        assetType,
        amount: parseBigInt(Math.floor(amountNum).toString()),
        offeredInterestRate: interestRateNum,
        durationDays: parseBigInt(durationNum.toString()),
        collateralType,
        collateralAmount: parseBigInt(Math.floor(collateralNum).toString()),
      });

      toast.success("Borrow request created successfully!");
      navigate({ to: "/marketplace" });
    } catch (error) {
      toast.error("Failed to create borrow request");
      console.error(error);
    }
  };

  if (!identity) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>You must be logged in to create a borrow request</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-6">
        <Link to="/marketplace">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-display">Create Borrow Request</CardTitle>
          <CardDescription>
            Request a loan from lenders. Specify your needs, offered interest rate, and collateral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select value={assetType} onValueChange={(value) => setAssetType(value as AssetType)}>
                <SelectTrigger id="assetType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Requested Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="offeredInterestRate">Offered Interest Rate (%) *</Label>
              <Input
                id="offeredInterestRate"
                type="number"
                step="0.01"
                placeholder="e.g., 5.5"
                value={offeredInterestRate}
                onChange={(e) => setOfferedInterestRate(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The interest rate you're willing to pay annually
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (Days) *</Label>
              <Input
                id="durationDays"
                type="number"
                placeholder="e.g., 30"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
              />
            </div>

            {/* Collateral Type */}
            <div className="space-y-2">
              <Label htmlFor="collateralType">Collateral Type *</Label>
              <Select
                value={collateralType}
                onValueChange={(value) => setCollateralType(value as AssetType)}
              >
                <SelectTrigger id="collateralType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collateral Amount */}
            <div className="space-y-2">
              <Label htmlFor="collateralAmount">Collateral Amount *</Label>
              <Input
                id="collateralAmount"
                type="number"
                step="0.01"
                placeholder="Enter collateral amount"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The collateral you're willing to provide to secure the loan
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/marketplace" })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending} className="flex-1">
                {createRequest.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
