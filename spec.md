# P2P Lending Platform MVP

## Current State

This is a new Caffeine project with:
- React + TypeScript + Tailwind CSS frontend setup
- Internet Identity authentication provider configured
- shadcn/ui component library installed
- No backend logic implemented yet
- No application UI components

## Requested Changes (Diff)

### Add

**Backend (Motoko)**
- User profile management with trust scores and reputation levels
- Loan listing creation and management (lenders post available funds)
- Borrow request creation and management (borrowers request loans)
- Loan matching and agreement system
- Collateral tracking for multiple asset types (simulated cryptos: BTC, ETH, SOL, BNB, ADA, XRP, DOT, MATIC, AVAX, LINK; commodities: Gold, Silver, Copper, Palladium, Platinum, Aluminum)
- Interest calculation and repayment tracking
- Trust score system based on completed loans, repayment history, and platform activity
- Gamification features: badges, user levels, achievement tracking
- Authorization with role-based access control for users

**Frontend (React + TypeScript)**
- Landing/Home page with platform overview and call-to-action
- Marketplace page showing available loans and borrow requests
- Loan creation form (for lenders)
- Borrow request form (for borrowers)
- Loan detail view with terms, collateral, and lender/borrower info
- User profile page with trust score, badges, level, transaction history
- Active loans dashboard (my loans, my borrowings)
- Repayment interface
- Trust score visualization and gamification elements
- Responsive navigation and layout

### Modify

No existing features to modify.

### Remove

No existing features to remove.

## Implementation Plan

1. **Select Caffeine Components**
   - Authorization (for secure user access and role management)

2. **Backend Generation (Motoko)**
   - User profile system with trust scores (0-1000), reputation levels (Novice, Bronze, Silver, Gold, Platinum, Diamond), and activity tracking
   - Loan listing CRUD with fields: amount, interest rate, duration, collateral type, collateral amount, status
   - Borrow request CRUD with similar fields
   - Loan agreement creation when lender and borrower match
   - Repayment tracking with installment schedules
   - Trust score algorithm: increases with successful loans, on-time repayments, platform activity; decreases with late payments or defaults
   - Badge system: First Loan, Trusted Lender, Reliable Borrower, High Roller, Community Star, etc.
   - Asset type support for 10 cryptos and 6 commodities

3. **Frontend Development**
   - Dashboard layout with navigation (Home, Marketplace, My Loans, Profile)
   - Marketplace with filters (asset type, loan amount, interest rate, duration)
   - Forms for creating loan offers and borrow requests with validation
   - Loan matching interface
   - Profile page with trust score gauge, level badge, achievement list
   - Repayment tracker with schedule and payment buttons
   - Toast notifications for actions
   - Loading states and error handling

4. **Validation and Testing**
   - TypeScript type checking
   - Linting
   - Build verification

## UX Notes

- **Trust First**: Trust scores and badges are prominently displayed to build confidence
- **Gamification**: Users see their progress through levels and badges, encouraging responsible behavior
- **Transparency**: All loan terms, collateral requirements, and borrower/lender profiles are visible
- **Simple Flows**: Clear CTAs for lending vs borrowing, streamlined forms
- **Safety**: Collateral requirements and trust scores help reduce risk
- **Activity Feed**: Users can see their loan history and track active agreements

The platform creates a marketplace where trust is earned through successful transactions, and gamification encourages long-term engagement and responsible lending/borrowing behavior.
