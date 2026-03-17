import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-background border-t border-border">
    <div className="max-w-6xl mx-auto px-8 py-16 lg:py-20">

      {/* Top row — Brand + link columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="md:col-span-1">
          <p className="font-display text-lg text-foreground mb-3">Castle Companion ✨</p>
          <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
            Be there for the magic — together.
          </p>
        </div>

        {/* Product */}
        <div>
          <p className="label-text mb-5 tracking-[0.2em]">Product</p>
          <ul className="space-y-3">
            {[
              { label: "How It Works", href: "https://www.castlecompanion.com/features" },
              { label: "Pricing", href: "https://www.castlecompanion.com/pricing" },
              { label: "Compare", href: "https://www.castlecompanion.com/compare" },
              { label: "Our Story", href: "https://www.castlecompanion.com/story" },
              { label: "FAQ", href: "https://www.castlecompanion.com/faq" },
            ].map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="label-text mb-5 tracking-[0.2em]">Legal</p>
          <ul className="space-y-3">
            <li>
              <Link to="/terms" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/privacy#cookies" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link to="/privacy#ccpa" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                CCPA / CPRA Notice
              </Link>
            </li>
            <li>
              <Link to="/privacy#do-not-sell" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Do Not Sell My Info
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="label-text mb-5 tracking-[0.2em]">Support</p>
          <ul className="space-y-3">
            {[
              { label: "Contact Us", href: "https://www.castlecompanion.com/contact" },
              { label: "Accessibility", href: "https://www.castlecompanion.com/accessibility" },
            ].map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="mailto:support@castlecompanion.com" className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                support@castlecompanion.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="divider mb-10" />

      {/* Non-affiliation disclaimer */}
      <div className="mb-8">
        <p className="font-editorial text-xs text-muted-foreground/60 leading-relaxed max-w-4xl">
          Castle Companion, LLC is <strong className="text-muted-foreground/80">not</strong> affiliated with, endorsed by, sponsored by, licensed by, or in any way associated with The Walt Disney Company, Walt Disney World Resort, Disneyland Resort, Disney Enterprises, Inc., or any of their parent companies, subsidiaries, affiliates, successors, or assigns. Castle Companion is also not affiliated with Universal Destinations &amp; Experiences, SeaWorld Parks &amp; Entertainment, or any other theme park owner or operator. All theme park names, attraction names, character names, and related intellectual property referenced within the Service are the trademarks and property of their respective owners.
        </p>
      </div>

      {/* AI-generated images notice */}
      <div className="mb-8">
        <p className="font-editorial text-xs text-muted-foreground/60 leading-relaxed">
          All images displayed in this application are AI-generated and do not depict real locations, persons, or events. They are used for illustrative and conceptual purposes only.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-editorial text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Castle Companion, LLC · 3400 Cottage Way, Ste G2 #34293 · Sacramento, CA 95825
        </p>
        <p className="label-text text-[0.55rem] tracking-[0.15em]">MMXXVI</p>
      </div>
    </div>
  </footer>
);

export default Footer;
