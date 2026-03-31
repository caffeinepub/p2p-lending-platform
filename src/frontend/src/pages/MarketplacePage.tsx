import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { AssetType } from "../backend";
import BorrowRequestCard from "../components/BorrowRequestCard";
import LoanListingCard from "../components/LoanListingCard";
import MarketChartsSection from "../components/MarketChartsSection";
import { useAllBorrowRequests, useAllLoanListings } from "../hooks/useQueries";
import { ASSET_OPTIONS } from "../utils/formatters";

export default function MarketplacePage() {
  const { data: listings, isLoading: listingsLoading } = useAllLoanListings();
  const { data: requests, isLoading: requestsLoading } = useAllBorrowRequests();
  const [assetFilter, setAssetFilter] = useState<AssetType | "all">("all");

  const availableListings =
    listings?.filter((l) => l.status === "available") || [];
  const openRequests = requests?.filter((r) => r.status === "open") || [];

  const filteredListings =
    assetFilter === "all"
      ? availableListings
      : availableListings.filter((l) => l.assetType === assetFilter);

  const filteredRequests =
    assetFilter === "all"
      ? openRequests
      : openRequests.filter((r) => r.assetType === assetFilter);

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3">
          Marketplace
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse available loan offers and borrow requests
        </p>
      </div>

      {/* Live Market Charts */}
      <MarketChartsSection />

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by asset:</span>
          <Select
            value={assetFilter}
            onValueChange={(value) =>
              setAssetFilter(value as AssetType | "all")
            }
          >
            <SelectTrigger className="w-[200px]" data-ocid="marketplace.select">
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
          <TabsTrigger value="listings" data-ocid="marketplace.tab">
            Loan Offers
            <Badge variant="secondary" className="ml-2">
              {filteredListings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" data-ocid="marketplace.tab">
            Borrow Requests
            <Badge variant="secondary" className="ml-2">
              {filteredRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listingsLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="listings.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="border-dashed" data-ocid="listings.empty_state">
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
              {filteredListings.map((listing, i) => (
                <div
                  key={listing.id.toString()}
                  data-ocid={`listings.item.${i + 1}`}
                >
                  <LoanListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {requestsLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="requests.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-dashed" data-ocid="requests.empty_state">
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
              {filteredRequests.map((request, i) => (
                <div
                  key={request.id.toString()}
                  data-ocid={`requests.item.${i + 1}`}
                >
                  <BorrowRequestCard request={request} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
