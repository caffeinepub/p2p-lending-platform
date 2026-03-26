import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    id: bigint;
    principal: Principal;
    loansGiven: bigint;
    name: string;
    badges: Array<Badge>;
    trustScore: bigint;
    successfulCompletions: bigint;
    reputation: Reputation;
    loansTaken: bigint;
    profileCreatedAt: Time;
    activeLoans: bigint;
}
export type Time = bigint;
export interface BorrowRequest {
    id: bigint;
    durationDays: bigint;
    offeredInterestRate: number;
    status: RequestStatus;
    createdAt: Time;
    collateralType: AssetType;
    borrower: Principal;
    collateralAmount: bigint;
    assetType: AssetType;
    amount: bigint;
}
export interface Badge {
    name: string;
    description: string;
    earnedAt: Time;
}
export interface LoanListing {
    id: bigint;
    durationDays: bigint;
    status: LoanStatus;
    createdAt: Time;
    minTrustScore: bigint;
    collateralType: AssetType;
    collateralAmount: bigint;
    interestRate: number;
    lender: Principal;
    assetType: AssetType;
    amount: bigint;
}
export interface Repayment {
    status: RepaymentStatus;
    timestamp: Time;
    amount: number;
}
export interface LoanAgreement {
    id: bigint;
    durationDays: bigint;
    status: AgreementStatus;
    repayments: Array<Repayment>;
    endDate: Time;
    totalRepayment: number;
    collateralType: AssetType;
    borrower: Principal;
    collateralAmount: bigint;
    interestRate: number;
    lender: Principal;
    assetType: AssetType;
    amount: bigint;
    startDate: Time;
}
export enum AgreementStatus {
    repaid = "repaid",
    active = "active",
    partial = "partial",
    defaulted = "defaulted"
}
export enum AssetType {
    ada = "ada",
    bnb = "bnb",
    btc = "btc",
    dot = "dot",
    eth = "eth",
    sol = "sol",
    xrp = "xrp",
    matic = "matic",
    aluminum = "aluminum",
    avax = "avax",
    gold = "gold",
    link = "link",
    platinum = "platinum",
    silver = "silver",
    copper = "copper",
    palladium = "palladium"
}
export enum LoanStatus {
    cancelled = "cancelled",
    completed = "completed",
    available = "available",
    matched = "matched"
}
export enum RepaymentStatus {
    late = "late",
    missed = "missed",
    onTime = "onTime"
}
export enum Reputation {
    bronze = "bronze",
    novice = "novice",
    gold = "gold",
    diamond = "diamond",
    platinum = "platinum",
    silver = "silver"
}
export enum RequestStatus {
    cancelled = "cancelled",
    open = "open",
    completed = "completed",
    matched = "matched"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(user: Principal, name: string, description: string): Promise<void>;
    createBorrowRequest(assetType: AssetType, amount: bigint, offeredInterestRate: number, durationDays: bigint, collateralType: AssetType, collateralAmount: bigint): Promise<BorrowRequest>;
    createLoanAgreement(lender: Principal, borrower: Principal, assetType: AssetType, amount: bigint, interestRate: number, durationDays: bigint, collateralType: AssetType, collateralAmount: bigint): Promise<LoanAgreement>;
    createLoanListing(assetType: AssetType, amount: bigint, interestRate: number, durationDays: bigint, collateralType: AssetType, collateralAmount: bigint, minTrustScore: bigint): Promise<LoanListing>;
    createProfile(name: string): Promise<UserProfile>;
    getAllBorrowRequests(): Promise<Array<BorrowRequest>>;
    getAllLoanListings(): Promise<Array<LoanListing>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getBadges(user: Principal): Promise<Array<Badge>>;
    getBorrowRequestsByBorrower(borrower: Principal): Promise<Array<BorrowRequest>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRepayments(): Promise<bigint>;
    getLoanAgreement(id: bigint): Promise<LoanAgreement>;
    getLoanListingsByLender(lender: Principal): Promise<Array<LoanListing>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    migrateRepayments(): Promise<void>;
    recordRepayment(agreementId: bigint, amount: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListingsByAmountRange(minAmount: bigint, maxAmount: bigint): Promise<Array<LoanListing>>;
    searchListingsByAsset(assetType: AssetType): Promise<Array<LoanListing>>;
    updateTrustScoreAndReputation(user: Principal, delta: bigint): Promise<void>;
}
