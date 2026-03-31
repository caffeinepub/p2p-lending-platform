import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssetType,
  Badge,
  BorrowRequest,
  LoanAgreement,
  LoanListing,
  UserProfile,
  UserRole,
} from "../backend";
import { useActor } from "./useActor";

// User Profile Queries
export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch (_error) {
        // Profile doesn't exist yet
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(principal?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserProfile(principal);
      } catch (_error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Profile Mutations
export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.createProfile(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// Loan Listing Queries
export function useAllLoanListings() {
  const { actor, isFetching } = useActor();
  return useQuery<LoanListing[]>({
    queryKey: ["loanListings"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllLoanListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLoanListingsByLender(lender?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<LoanListing[]>({
    queryKey: ["loanListings", "lender", lender?.toString()],
    queryFn: async () => {
      if (!actor || !lender) return [];
      return await actor.getLoanListingsByLender(lender);
    },
    enabled: !!actor && !isFetching && !!lender,
  });
}

export function useSearchListingsByAsset(assetType?: AssetType) {
  const { actor, isFetching } = useActor();
  return useQuery<LoanListing[]>({
    queryKey: ["loanListings", "asset", assetType],
    queryFn: async () => {
      if (!actor || !assetType) return [];
      return await actor.searchListingsByAsset(assetType);
    },
    enabled: !!actor && !isFetching && !!assetType,
  });
}

// Loan Listing Mutations
export function useCreateLoanListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      assetType: AssetType;
      amount: bigint;
      interestRate: number;
      durationDays: bigint;
      collateralType: AssetType;
      collateralAmount: bigint;
      minTrustScore: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.createLoanListing(
        params.assetType,
        params.amount,
        params.interestRate,
        params.durationDays,
        params.collateralType,
        params.collateralAmount,
        params.minTrustScore,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loanListings"] });
    },
  });
}

// Borrow Request Queries
export function useAllBorrowRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<BorrowRequest[]>({
    queryKey: ["borrowRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllBorrowRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBorrowRequestsByBorrower(borrower?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<BorrowRequest[]>({
    queryKey: ["borrowRequests", "borrower", borrower?.toString()],
    queryFn: async () => {
      if (!actor || !borrower) return [];
      return await actor.getBorrowRequestsByBorrower(borrower);
    },
    enabled: !!actor && !isFetching && !!borrower,
  });
}

// Borrow Request Mutations
export function useCreateBorrowRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      assetType: AssetType;
      amount: bigint;
      offeredInterestRate: number;
      durationDays: bigint;
      collateralType: AssetType;
      collateralAmount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.createBorrowRequest(
        params.assetType,
        params.amount,
        params.offeredInterestRate,
        params.durationDays,
        params.collateralType,
        params.collateralAmount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowRequests"] });
    },
  });
}

// Loan Agreement Queries
export function useLoanAgreement(id?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<LoanAgreement | null>({
    queryKey: ["loanAgreement", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      try {
        return await actor.getLoanAgreement(id);
      } catch (_error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

// Loan Agreement Mutations
export function useCreateLoanAgreement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      lender: Principal;
      borrower: Principal;
      assetType: AssetType;
      amount: bigint;
      interestRate: number;
      durationDays: bigint;
      collateralType: AssetType;
      collateralAmount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.createLoanAgreement(
        params.lender,
        params.borrower,
        params.assetType,
        params.amount,
        params.interestRate,
        params.durationDays,
        params.collateralType,
        params.collateralAmount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loanListings"] });
      queryClient.invalidateQueries({ queryKey: ["borrowRequests"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useRecordRepayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { agreementId: bigint; amount: number }) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.recordRepayment(params.agreementId, params.amount);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["loanAgreement", variables.agreementId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// Badge Queries
export function useBadges(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<Badge[]>({
    queryKey: ["badges", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return await actor.getBadges(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// User Role Queries
export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
