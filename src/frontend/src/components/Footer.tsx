import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2026. Built with{" "}
            <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Powered by Internet Computer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
