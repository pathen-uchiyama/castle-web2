import { motion } from "framer-motion";
import CircleManager from "@/components/CircleManager";
import CaptureConsentToggle from "@/components/CaptureConsentToggle";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface MemoriesCircleProps {
  captureConsented: boolean;
  onConsent: (agreed: boolean) => void;
}

/**
 * Circle & Safety tab — consent toggle + sharing manager
 * on sharp-edged parchment cards.
 */
const MemoriesCircle = ({ captureConsented, onConsent }: MemoriesCircleProps) => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Consent — presented on first entry */}
        {!captureConsented && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
          >
            <p
              className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
              style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
            >
              Before We Begin
            </p>
            <h2 className="font-display text-3xl text-foreground leading-[1.12] mb-6">
              Your Safety Comes First
            </h2>
            <CaptureConsentToggle onConsent={onConsent} isAgreed={captureConsented} />
          </motion.div>
        )}

        {/* Secure Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease }}
        >
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            The Sovereign Circle
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
            Secure Sharing
          </h2>
          <p
            className="text-muted-foreground max-w-xl mb-12"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em" }}
          >
            Send "Guest Viewer" links to family and friends so they can relive your trip highlights — privately and beautifully.
          </p>

          <CircleManager />
        </motion.div>
      </div>
    </section>
  );
};

export default MemoriesCircle;
