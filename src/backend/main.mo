import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type Definitions
  type LoanStatus = { #available; #matched; #completed; #cancelled };
  type RequestStatus = { #open; #matched; #completed; #cancelled };
  type AgreementStatus = { #active; #repaid; #defaulted; #partial };
  type Reputation = { #novice; #bronze; #silver; #gold; #platinum; #diamond };
  type RepaymentStatus = { #onTime; #late; #missed };

  type AssetType = {
    #btc;
    #eth;
    #sol;
    #bnb;
    #ada;
    #xrp;
    #dot;
    #matic;
    #avax;
    #link;
    #gold;
    #silver;
    #copper;
    #palladium;
    #platinum;
    #aluminum;
  };

  public type UserProfile = {
    id : Nat;
    principal : Principal;
    name : Text;
    trustScore : Nat;
    reputation : Reputation;
    loansGiven : Nat;
    loansTaken : Nat;
    successfulCompletions : Nat;
    activeLoans : Nat;
    badges : [Badge];
    profileCreatedAt : Time.Time;
  };

  public type LoanListing = {
    id : Nat;
    lender : Principal;
    assetType : AssetType;
    amount : Nat;
    interestRate : Float;
    durationDays : Nat;
    collateralType : AssetType;
    collateralAmount : Nat;
    minTrustScore : Nat;
    status : LoanStatus;
    createdAt : Time.Time;
  };

  public type BorrowRequest = {
    id : Nat;
    borrower : Principal;
    assetType : AssetType;
    amount : Nat;
    offeredInterestRate : Float;
    durationDays : Nat;
    collateralType : AssetType;
    collateralAmount : Nat;
    status : RequestStatus;
    createdAt : Time.Time;
  };

  public type LoanAgreement = {
    id : Nat;
    lender : Principal;
    borrower : Principal;
    assetType : AssetType;
    amount : Nat;
    interestRate : Float;
    durationDays : Nat;
    collateralType : AssetType;
    collateralAmount : Nat;
    startDate : Time.Time;
    endDate : Time.Time;
    totalRepayment : Float;
    status : AgreementStatus;
    repayments : [Repayment];
  };

  public type Repayment = {
    amount : Float;
    timestamp : Time.Time;
    status : RepaymentStatus;
  };

  public type Badge = {
    name : Text;
    description : Text;
    earnedAt : Time.Time;
  };

  // Storage
  let profiles = Map.empty<Principal, UserProfile>();
  let loanListings = Map.empty<Nat, LoanListing>();
  let borrowRequests = Map.empty<Nat, BorrowRequest>();
  let loanAgreements = Map.empty<Nat, LoanAgreement>();
  let allBadges = Map.empty<Principal, List.List<Badge>>();

  var nextListingId = 1;
  var nextRequestId = 1;
  var nextAgreementId = 1;
  var nextProfileId = 1;
  var onTimeRepayments = 0;

  public query ({ caller }) func getCurrentRepayments() : async Nat {
    onTimeRepayments;
  };

  // Authorization State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Profile Management
  public shared ({ caller }) func createProfile(name : Text) : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    if (profiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };

    let profile : UserProfile = {
      id = nextProfileId;
      principal = caller;
      name;
      trustScore = 500;
      reputation = #novice;
      loansGiven = 0;
      loansTaken = 0;
      successfulCompletions = 0;
      activeLoans = 0;
      badges = [];
      profileCreatedAt = Time.now();
    };

    profiles.add(caller, profile);
    nextProfileId += 1;
    profile;
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?p) { p };
    };

    // Only allow updating name, preserve system-managed fields
    let updatedProfile : UserProfile = {
      id = existingProfile.id;
      principal = existingProfile.principal;
      name = profile.name;
      trustScore = existingProfile.trustScore;
      reputation = existingProfile.reputation;
      loansGiven = existingProfile.loansGiven;
      loansTaken = existingProfile.loansTaken;
      successfulCompletions = existingProfile.successfulCompletions;
      activeLoans = existingProfile.activeLoans;
      badges = existingProfile.badges;
      profileCreatedAt = existingProfile.profileCreatedAt;
    };

    profiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?profile) { profile };
    };
  };

  // Loan Listing Management
  public shared ({ caller }) func createLoanListing(
    assetType : AssetType,
    amount : Nat,
    interestRate : Float,
    durationDays : Nat,
    collateralType : AssetType,
    collateralAmount : Nat,
    minTrustScore : Nat,
  ) : async LoanListing {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let validatedInterestRate : Float = if (interestRate < 0.0) { 0.0 } else { interestRate };

    let listing : LoanListing = {
      id = nextListingId;
      lender = caller;
      assetType;
      amount;
      interestRate = validatedInterestRate;
      durationDays;
      collateralType;
      collateralAmount;
      minTrustScore;
      status = #available;
      createdAt = Time.now();
    };

    loanListings.add(nextListingId, listing);
    nextListingId += 1;
    listing;
  };

  public query ({ caller }) func getAllLoanListings() : async [LoanListing] {
    loanListings.values().toArray();
  };

  public query ({ caller }) func getLoanListingsByLender(lender : Principal) : async [LoanListing] {
    let iter = loanListings.values();
    let filtered = iter.filter(
      func(l) {
        l.lender == lender;
      }
    );
    filtered.toArray();
  };

  // Borrow Request Management
  public shared ({ caller }) func createBorrowRequest(
    assetType : AssetType,
    amount : Nat,
    offeredInterestRate : Float,
    durationDays : Nat,
    collateralType : AssetType,
    collateralAmount : Nat,
  ) : async BorrowRequest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create requests");
    };

    let request : BorrowRequest = {
      id = nextRequestId;
      borrower = caller;
      assetType;
      amount;
      offeredInterestRate;
      durationDays;
      collateralType;
      collateralAmount;
      status = #open;
      createdAt = Time.now();
    };

    borrowRequests.add(nextRequestId, request);
    nextRequestId += 1;
    request;
  };

  public query ({ caller }) func getAllBorrowRequests() : async [BorrowRequest] {
    borrowRequests.values().toArray();
  };

  public query ({ caller }) func getBorrowRequestsByBorrower(borrower : Principal) : async [BorrowRequest] {
    let iter = borrowRequests.values();
    let filtered = iter.filter(
      func(br) {
        br.borrower == borrower;
      }
    );
    filtered.toArray();
  };

  // Agreement Creation - Both parties must be involved
  public shared ({ caller }) func createLoanAgreement(
    lender : Principal,
    borrower : Principal,
    assetType : AssetType,
    amount : Nat,
    interestRate : Float,
    durationDays : Nat,
    collateralType : AssetType,
    collateralAmount : Nat,
  ) : async LoanAgreement {
    // Only the lender or borrower can initiate, but both must consent
    // The caller must be one of the parties involved
    if (caller != lender and caller != borrower) {
      Runtime.trap("Unauthorized: Only parties involved can create agreement");
    };

    // Verify both parties have user profiles (implicit consent to platform)
    let lenderProfile = switch (profiles.get(lender)) {
      case (null) { Runtime.trap("Lender profile not found") };
      case (?p) { p };
    };

    let borrowerProfile = switch (profiles.get(borrower)) {
      case (null) { Runtime.trap("Borrower profile not found") };
      case (?p) { p };
    };

    let startDate = Time.now();
    let endDate = startDate + (durationDays * 24 * 3600 * 1_000_000_000);
    let totalRepayment = amount.toFloat() * (1.0 + (interestRate / 100.0));

    let agreement : LoanAgreement = {
      id = nextAgreementId;
      lender;
      borrower;
      assetType;
      amount;
      interestRate;
      durationDays;
      collateralType;
      collateralAmount;
      startDate;
      endDate;
      totalRepayment;
      status = #active;
      repayments = [];
    };

    loanAgreements.add(nextAgreementId, agreement);
    nextAgreementId += 1;
    agreement;
  };

  public shared ({ caller }) func recordRepayment(agreementId : Nat, amount : Float) : async () {
    let agreement = switch (loanAgreements.get(agreementId)) {
      case (null) { Runtime.trap("Agreement not found") };
      case (?a) { a };
    };

    if (caller != agreement.borrower) {
      Runtime.trap("Unauthorized: Only borrower can make repayments");
    };

    let repaymentStatus : RepaymentStatus = if (Time.now() <= agreement.endDate) {
      #onTime;
    } else {
      #late;
    };

    let repayment : Repayment = {
      amount;
      timestamp = Time.now();
      status = repaymentStatus;
    };

    let repaymentsList : List.List<Repayment> = List.fromArray(agreement.repayments);
    repaymentsList.add(repayment);
    let updatedRepayments = repaymentsList.toArray();

    let updatedAgreement : LoanAgreement = {
      id = agreement.id;
      lender = agreement.lender;
      borrower = agreement.borrower;
      assetType = agreement.assetType;
      amount = agreement.amount;
      interestRate = agreement.interestRate;
      durationDays = agreement.durationDays;
      collateralType = agreement.collateralType;
      collateralAmount = agreement.collateralAmount;
      startDate = agreement.startDate;
      endDate = agreement.endDate;
      totalRepayment = agreement.totalRepayment;
      status = agreement.status;
      repayments = updatedRepayments;
    };

    loanAgreements.add(agreementId, updatedAgreement);

    if (repaymentStatus == #onTime) {
      onTimeRepayments += 1;
    };
  };

  // Trust Score & Reputation System - ADMIN ONLY (automatic system updates)
  public shared ({ caller }) func updateTrustScoreAndReputation(user : Principal, delta : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update trust scores");
    };

    let profile = switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };

    var newScore : Nat = if (delta < 0) {
      let absDelta = (-delta).toNat();
      if (profile.trustScore <= absDelta) { 0 } else { profile.trustScore - absDelta };
    } else {
      let positiveDelta = delta.toNat();
      profile.trustScore + positiveDelta;
    };

    if (newScore > 1000) { newScore := 1000 };

    let newReputation : Reputation = if (newScore < 100) {
      #novice;
    } else if (newScore < 250) {
      #bronze;
    } else if (newScore < 500) {
      #silver;
    } else if (newScore < 750) {
      #gold;
    } else if (newScore < 900) {
      #platinum;
    } else { #diamond };

    let updatedProfile : UserProfile = {
      id = profile.id;
      principal = profile.principal;
      name = profile.name;
      trustScore = newScore;
      reputation = newReputation;
      loansGiven = profile.loansGiven;
      loansTaken = profile.loansTaken;
      successfulCompletions = profile.successfulCompletions;
      activeLoans = profile.activeLoans;
      badges = profile.badges;
      profileCreatedAt = profile.profileCreatedAt;
    };

    profiles.add(user, updatedProfile);
  };

  // Badge System - ADMIN ONLY (automatic system awards)
  public shared ({ caller }) func awardBadge(user : Principal, name : Text, description : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can award badges");
    };

    let newBadge : Badge = {
      name;
      description;
      earnedAt = Time.now();
    };

    let userBadges : List.List<Badge> = switch (allBadges.get(user)) {
      case (null) { List.empty<Badge>() };
      case (?badges) { badges };
    };

    userBadges.add(newBadge);

    allBadges.add(user, userBadges);
  };

  public query ({ caller }) func getBadges(user : Principal) : async [Badge] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own badges");
    };

    let badges = switch (allBadges.get(user)) {
      case (null) { List.empty<Badge>() };
      case (?badges) { badges };
    };
    badges.toArray().reverse();
  };

  // Marketplace Search & Filtering - Public access for marketplace browsing
  public query ({ caller }) func searchListingsByAsset(assetType : AssetType) : async [LoanListing] {
    let iter = loanListings.values();
    let filtered = iter.filter(
      func(l) {
        l.assetType == assetType;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func searchListingsByAmountRange(minAmount : Nat, maxAmount : Nat) : async [LoanListing] {
    let iter = loanListings.values();
    let filtered = iter.filter(
      func(l) {
        l.amount >= minAmount and l.amount <= maxAmount
      }
    );
    filtered.toArray();
  };

  // ADMIN ONLY: Get All Users
  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    profiles.values().toArray();
  };

  public shared ({ caller }) func migrateRepayments() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let newRepayments = 0;
    onTimeRepayments := newRepayments;
  };

  public query ({ caller }) func getLoanAgreement(id : Nat) : async LoanAgreement {
    let agreement = switch (loanAgreements.get(id)) {
      case (null) { Runtime.trap("Agreement not found") };
      case (?a) { a };
    };

    // Only parties involved or admin can view agreement details
    if (caller != agreement.lender and caller != agreement.borrower and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only parties involved can view agreement");
    };

    agreement;
  };
};
