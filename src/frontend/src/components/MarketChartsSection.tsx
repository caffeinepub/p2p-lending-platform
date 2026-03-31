import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SparkPoint {
  t: number;
  v: number;
}

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change24h: number;
  sparkline: SparkPoint[];
}

interface MetalAsset {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  price: number;
  change24h: number;
  sparkline: SparkPoint[];
}

// ─── CoinGecko API ────────────────────────────────────────────────────────────

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd" +
  "&ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,polkadot,matic-network,avalanche-2,chainlink" +
  "&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h";

async function fetchCoinGecko(): Promise<CryptoAsset[]> {
  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return (data as any[]).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    image: c.image,
    price: c.current_price,
    change24h: c.price_change_percentage_24h ?? 0,
    sparkline: (c.sparkline_in_7d?.price ?? []).map((v: number, i: number) => ({
      t: i,
      v,
    })),
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number, decimals = 2): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1) return price.toFixed(decimals);
  return price.toFixed(4);
}

function generateSparkline(seed: number, points = 30): SparkPoint[] {
  const result: SparkPoint[] = [];
  let val = seed;
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    val = val * (1 + (Math.random() - 0.5) * 0.012);
    result.push({ t: now - i * 4 * 60 * 60 * 1000, v: val });
  }
  return result;
}

const FALLBACK_CRYPTOS: CryptoAsset[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    image: "",
    price: 67000,
    change24h: 1.2,
    sparkline: [],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    image: "",
    price: 3500,
    change24h: 0.8,
    sparkline: [],
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    image: "",
    price: 175,
    change24h: 2.1,
    sparkline: [],
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    image: "",
    price: 580,
    change24h: -0.5,
    sparkline: [],
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    image: "",
    price: 0.45,
    change24h: -1.1,
    sparkline: [],
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    image: "",
    price: 0.52,
    change24h: 0.3,
    sparkline: [],
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    image: "",
    price: 7.8,
    change24h: 1.5,
    sparkline: [],
  },
  {
    id: "matic-network",
    name: "Polygon",
    symbol: "MATIC",
    image: "",
    price: 0.72,
    change24h: -0.9,
    sparkline: [],
  },
  {
    id: "avalanche-2",
    name: "Avalanche",
    symbol: "AVAX",
    image: "",
    price: 35,
    change24h: 3.2,
    sparkline: [],
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    image: "",
    price: 14.5,
    change24h: -0.6,
    sparkline: [],
  },
].map((c) => ({ ...c, sparkline: generateSparkline(c.price) }));

// ─── Live Ticker Marquee ──────────────────────────────────────────────────────

function LiveTicker({ coins }: { coins: CryptoAsset[] }) {
  // Duplicate items for a seamless infinite scroll
  const items = [...coins, ...coins];

  return (
    <div
      className="mb-4 rounded-lg overflow-hidden border border-border/40 bg-card/60 relative"
      style={{ height: 44 }}
      data-ocid="market_charts.panel"
    >
      <div
        className="ticker-track flex items-center gap-8 absolute whitespace-nowrap"
        style={{ top: 0, left: 0 }}
      >
        {items.map((coin, i) => {
          const positive = coin.change24h >= 0;
          const key = i < coins.length ? coin.id : `${coin.id}-clone`;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2.5"
            >
              {coin.image && (
                <img
                  src={coin.image}
                  alt={coin.symbol}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="font-bold">{coin.symbol}</span>
              <span className="text-foreground/80">
                ${formatPrice(coin.price)}
              </span>
              <span className={positive ? "text-green-500" : "text-red-500"}>
                {positive ? "+" : ""}
                {coin.change24h.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Crypto Tab ───────────────────────────────────────────────────────────────

function CryptoTab() {
  const [coins, setCoins] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchCoinGecko();
        if (!cancelled) {
          setCoins(data);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setCoins(FALLBACK_CRYPTOS);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        data-ocid="market_charts.loading_state"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-7 h-7 rounded-full" />
                <div>
                  <Skeleton className="w-12 h-3 mb-1" />
                  <Skeleton className="w-16 h-2" />
                </div>
              </div>
              <Skeleton className="w-24 h-5 mb-2" />
              <Skeleton className="w-full h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p
          className="text-xs text-amber-500 mb-3"
          data-ocid="market_charts.error_state"
        >
          ⚠ Live data unavailable — showing simulated prices
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {coins.map((coin, i) => (
          <div key={coin.id} data-ocid={`market_charts.item.${i + 1}`}>
            <AssetCard
              name={coin.name}
              symbol={coin.symbol}
              price={coin.price}
              change24h={coin.change24h}
              sparkline={coin.sparkline}
              image={coin.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline Chart ──────────────────────────────────────────────────────────

function SparklineChart({
  data,
  positive,
}: { data: SparkPoint[]; positive: boolean }) {
  const color = positive ? "#22c55e" : "#ef4444";
  const gradientId = `grad-${positive ? "pos" : "neg"}`;

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" hide />
        <YAxis domain={["dataMin", "dataMax"]} hide />
        <RechartsTooltip
          content={({ payload }) => {
            if (!payload?.length) return null;
            return (
              <div className="bg-popover border border-border rounded px-2 py-1 text-xs">
                ${formatPrice(payload[0].value as number)}
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({
  name,
  symbol,
  price,
  change24h,
  unit,
  sparkline,
  image,
}: {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  unit?: string;
  sparkline: SparkPoint[];
  image?: string;
}) {
  const positive = change24h >= 0;

  return (
    <Card className="overflow-hidden border-border/60 hover:border-border transition-colors bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {image ? (
              <img src={image} alt={name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm leading-none">
                {symbol.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{name}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-green-500" : "text-red-500"
            }`}
          >
            {positive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {positive ? "+" : ""}
            {change24h.toFixed(2)}%
          </div>
        </div>

        <div className="mb-1">
          <span className="text-lg font-bold">${formatPrice(price)}</span>
          {unit && (
            <span className="text-xs text-muted-foreground ml-1">{unit}</span>
          )}
        </div>

        <SparklineChart data={sparkline} positive={positive} />
      </CardContent>
    </Card>
  );
}

// ─── Metals Tab ───────────────────────────────────────────────────────────────

const METALS_SEED: Omit<MetalAsset, "sparkline">[] = [
  {
    id: "xau",
    name: "Gold",
    symbol: "XAU",
    unit: "/ troy oz",
    price: 2352,
    change24h: 0.42,
  },
  {
    id: "xag",
    name: "Silver",
    symbol: "XAG",
    unit: "/ troy oz",
    price: 28.15,
    change24h: -0.31,
  },
  {
    id: "xpd",
    name: "Palladium",
    symbol: "XPD",
    unit: "/ troy oz",
    price: 1048,
    change24h: 1.12,
  },
  {
    id: "xpt",
    name: "Platinum",
    symbol: "XPT",
    unit: "/ troy oz",
    price: 963,
    change24h: -0.18,
  },
  {
    id: "xcu",
    name: "Copper",
    symbol: "XCU",
    unit: "/ lb",
    price: 4.21,
    change24h: 0.67,
  },
  {
    id: "xal",
    name: "Aluminum",
    symbol: "XAL",
    unit: "/ lb",
    price: 0.112,
    change24h: -0.09,
  },
];

function MetalsTab() {
  const [metals, setMetals] = useState<MetalAsset[]>(() =>
    METALS_SEED.map((m) => ({ ...m, sparkline: generateSparkline(m.price) })),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMetals((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.5) * 0.006;
          const newPrice = m.price * (1 + delta);
          const lastPoint: SparkPoint = { t: Date.now(), v: newPrice };
          const newSparkline = [...m.sparkline.slice(-29), lastPoint];
          return {
            ...m,
            price: newPrice,
            change24h: m.change24h + (Math.random() - 0.5) * 0.05,
            sparkline: newSparkline,
          };
        }),
      );
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {metals.map((metal) => (
        <AssetCard
          key={metal.id}
          name={metal.name}
          symbol={metal.symbol}
          price={metal.price}
          change24h={metal.change24h}
          unit={metal.unit}
          sparkline={metal.sparkline}
        />
      ))}
    </div>
  );
}

// ─── Stocks Coming Soon ───────────────────────────────────────────────────────

function StocksComingSoon() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid="stocks.panel"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        Stock Market Charts Coming Soon
      </h3>
      <p className="text-muted-foreground max-w-sm">
        Real-time stock market data will be available in a future update. Stay
        tuned for live equity and ETF charts.
      </p>
      <Badge variant="secondary" className="mt-4">
        Coming Soon
      </Badge>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function MarketChartsSection() {
  const [liveCoins, setLiveCoins] = useState<CryptoAsset[]>(FALLBACK_CRYPTOS);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchCoinGecko();
        if (!cancelled)
          setLiveCoins(data.map((c) => ({ ...c, sparkline: [] })));
      } catch {
        // keep fallback
      }
    };
    load();
    const t = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <section className="mb-10" data-ocid="market_charts.section">
      <LiveTicker coins={liveCoins} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-display font-bold">Live Market Data</h2>
          <Badge
            variant="outline"
            className="border-green-500/50 text-green-500 text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse inline-block" />
            Live
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Powered by CoinGecko
        </p>
      </div>

      <Tabs defaultValue="crypto">
        <TabsList className="mb-4">
          <TabsTrigger value="crypto" data-ocid="market_charts.tab">
            Crypto
          </TabsTrigger>
          <TabsTrigger value="metals" data-ocid="market_charts.tab">
            Precious Metals
            <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">
              Simulated
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="stocks" data-ocid="market_charts.tab">
            Stocks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <CryptoTab />
        </TabsContent>
        <TabsContent value="metals">
          <MetalsTab />
        </TabsContent>
        <TabsContent value="stocks">
          <StocksComingSoon />
        </TabsContent>
      </Tabs>
    </section>
  );
}
