import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAllLoanListings, useAllBorrowRequests } from "../hooks/useQueries";
import LoanListingCard from "../components/LoanListingCard";
import BorrowRequestCard from "../components/BorrowRequestCard";
import { AssetType } from "../backend";
import { ASSET_OPTIONS } from "../utils/formatters";

export default function MarketplacePage() {
  const { data: listings, isLoading: listingsLoading } = useAllLoanListings();
  const { data: requests, isLoading: requestsLoading } = useAllBorrowRequests();
  const [assetFilter, setAssetFilter] = useState<AssetType | "all">("all");

  const availableListings = listings?.filter((l) => l.status === "available") || [];
  const openRequests = requests?.filter((r) => r.status === "open") || [];

  const filteredListings = assetFilter === "all"
    ? availableListings
    : availableListings.filter((l) => l.assetType === assetFilter);

  const filteredRequests = assetFilter === "all"
    ? openRequests
    : openRequests.filter((r) => r.assetType === assetFilter);

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3">Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Browse available loan offers and borrow requests
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by asset:</span>
          <Select
            value={assetFilter}
            onValueChange={(value) => setAssetFilter(value as AssetType | "all")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {ASSET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="listings">
            Loan Offers
            <Badge variant="secondary" className="ml-2">
              {filteredListings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            Borrow Requests
            <Badge variant="secondary" className="ml-2">
              {filteredRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Loan Offers Available</CardTitle>
                <CardDescription>
                  {assetFilter !== "all"
                    ? "Try changing the asset filter or check back later."
                    : "Be the first to create a loan offer!"}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <LoanListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Borrow Requests Available</CardTitle>
                <CardDescription>
                  {assetFilter !== "all"
                    ? "Try changing the asset filter or check back later."
                    : "Be the first to create a borrow request!"}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <BorrowRequestCard key={request.id.toString()} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
