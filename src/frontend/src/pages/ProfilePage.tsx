import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Award, TrendingUp, HandshakeIcon, CheckCircle2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useBadges } from "../hooks/useQueries";
import {
  getTrustScorePercentage,
  getTrustScoreColor,
  REPUTATION_LABELS,
  REPUTATION_COLORS,
  truncatePrincipal,
  formatTimestamp,
} from "../utils/formatters";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: badges, isLoading: badgesLoading } = useBadges(identity?.getPrincipal());

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

  if (!profile) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const trustScorePercent = getTrustScorePercentage(profile.trustScore);
  const trustScore = Number(profile.trustScore);

  return (
    <div className="container py-8 lg:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-display mb-2">{profile.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">
                  {truncatePrincipal(profile.principal.toString())}
                </p>
              </div>
              <Badge className={`text-base px-4 py-2 ${REPUTATION_COLORS[profile.reputation]}`}>
                {REPUTATION_LABELS[profile.reputation]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trust Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trust Score</h3>
                <span className={`text-3xl font-display font-bold ${getTrustScoreColor(profile.trustScore)}`}>
                  {trustScore}/1000
                </span>
              </div>
              <Progress value={trustScorePercent} className="h-4" />
              <p className="text-sm text-muted-foreground">
                {trustScore < 400
                  ? "Build trust by completing loans successfully"
                  : trustScore < 700
                  ? "Good standing - keep building your reputation"
                  : trustScore < 900
                  ? "Excellent reputation - unlock premium features"
                  : "Outstanding trust score - you're a top-tier user"}
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">{Number(profile.loansGiven)}</div>
                  <div className="text-xs text-muted-foreground">Loans Given</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <HandshakeIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">{Number(profile.loansTaken)}</div>
                  <div className="text-xs text-muted-foreground">Loans Taken</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">
                    {Number(profile.successfulCompletions)}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5 border border-warning/20">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">{Number(profile.activeLoans)}</div>
                  <div className="text-xs text-muted-foreground">Active Loans</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badgesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !badges || badges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm mt-1">Complete loans to unlock achievements</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Earned {formatTimestamp(badge.earnedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Principal ID:</span>
              <span className="font-mono text-xs">{profile.principal.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member Since:</span>
              <span>{formatTimestamp(profile.profileCreatedAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">User ID:</span>
              <span>#{profile.id.toString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
