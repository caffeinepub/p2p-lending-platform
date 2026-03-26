import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLoanListing } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ASSET_OPTIONS, parseBigInt } from "../utils/formatters";
import { AssetType } from "../backend";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function CreateLoanListingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createListing = useCreateLoanListing();

  const [assetType, setAssetType] = useState<AssetType>(AssetType.btc);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [collateralType, setCollateralType] = useState<AssetType>(AssetType.eth);
  const [collateralAmount, setCollateralAmount] = useState("");
  const [minTrustScore, setMinTrustScore] = useState("500");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error("Please login to create a loan listing");
      return;
    }

    // Validation
    if (!assetType || !amount || !interestRate || !durationDays || !collateralType || !collateralAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    const interestRateNum = parseFloat(interestRate);
    const durationNum = parseInt(durationDays);
    const collateralNum = parseFloat(collateralAmount);
    const trustScoreNum = parseInt(minTrustScore);

    if (amountNum <= 0 || interestRateNum < 0 || durationNum <= 0 || collateralNum <= 0 || trustScoreNum < 0 || trustScoreNum > 1000) {
      toast.error("Please enter valid positive values");
      return;
    }

    try {
      await createListing.mutateAsync({
        assetType,
        amount: parseBigInt(Math.floor(amountNum).toString()),
        interestRate: interestRateNum,
        durationDays: parseBigInt(durationNum.toString()),
        collateralType,
        collateralAmount: parseBigInt(Math.floor(collateralNum).toString()),
        minTrustScore: parseBigInt(trustScoreNum.toString()),
      });

      toast.success("Loan listing created successfully!");
      navigate({ to: "/marketplace" });
    } catch (error) {
      toast.error("Failed to create loan listing");
      console.error(error);
    }
  };

  if (!identity) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>You must be logged in to create a loan listing</CardDescription>
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
          <CardTitle className="text-3xl font-display">Create Loan Listing</CardTitle>
          <CardDescription>
            Offer a loan to borrowers. Set your terms, interest rate, and collateral requirements.
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
              <Label htmlFor="amount">Loan Amount *</Label>
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
              <Label htmlFor="interestRate">Interest Rate (%) *</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="e.g., 5.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Annual interest rate</p>
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
            </div>

            {/* Min Trust Score */}
            <div className="space-y-2">
              <Label htmlFor="minTrustScore">Minimum Trust Score (0-1000) *</Label>
              <Input
                id="minTrustScore"
                type="number"
                min="0"
                max="1000"
                placeholder="e.g., 500"
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Only borrowers with this trust score or higher can accept your offer
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
              <Button type="submit" disabled={createListing.isPending} className="flex-1">
                {createListing.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
