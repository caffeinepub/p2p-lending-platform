import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBorrowRequestsByBorrower,
  useCallerUserProfile,
  useLoanListingsByLender,
} from "../hooks/useQueries";
import {
  ASSET_SYMBOLS,
  formatBigInt,
  formatDuration,
  formatPercentage,
  formatTimestamp,
} from "../utils/formatters";

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: myListings, isLoading: listingsLoading } =
    useLoanListingsByLender(identity?.getPrincipal());
  const { data: myRequests, isLoading: requestsLoading } =
    useBorrowRequestsByBorrower(identity?.getPrincipal());

  if (!identity) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeLoans = Number(profile?.activeLoans || 0);
  const totalLent = Number(profile?.loansGiven || 0);
  const totalBorrowed = Number(profile?.loansTaken || 0);

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3">
          My Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your loans, listings, and requests
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">
              {activeLoans}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Lent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-success">
              {totalLent}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Borrowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-accent">
              {totalBorrowed}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2">
          <TabsTrigger value="listings">
            My Listings
            <Badge variant="secondary" className="ml-2">
              {myListings?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            My Requests
            <Badge variant="secondary" className="ml-2">
              {myRequests?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !myListings || myListings.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Loan Listings Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/create-loan-listing">
                  <Button>Create Your First Listing</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myListings.map((listing) => (
                <Card key={listing.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-display">
                          {formatBigInt(listing.amount, 0)}{" "}
                          {ASSET_SYMBOLS[listing.assetType]}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {formatTimestamp(listing.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          listing.status === "available"
                            ? "default"
                            : listing.status === "matched"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Interest Rate:
                        </span>
                        <div className="font-semibold">
                          {formatPercentage(listing.interestRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-semibold">
                          {formatDuration(listing.durationDays)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Collateral:
                        </span>
                        <div className="font-semibold">
                          {formatBigInt(listing.collateralAmount, 0)}{" "}
                          {ASSET_SYMBOLS[listing.collateralType]}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !myRequests || myRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Borrow Requests Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/create-borrow-request">
                  <Button>Create Your First Request</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-display">
                          {formatBigInt(request.amount, 0)}{" "}
                          {ASSET_SYMBOLS[request.assetType]}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {formatTimestamp(request.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "open"
                            ? "default"
                            : request.status === "matched"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Interest Rate:
                        </span>
                        <div className="font-semibold">
                          {formatPercentage(request.offeredInterestRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-semibold">
                          {formatDuration(request.durationDays)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Collateral:
                        </span>
                        <div className="font-semibold">
                          {formatBigInt(request.collateralAmount, 0)}{" "}
                          {ASSET_SYMBOLS[request.collateralType]}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
