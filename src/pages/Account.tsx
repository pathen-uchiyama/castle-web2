import { motion } from "framer-motion";
import type { AccountProfile } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

interface AccountProps {
  account: AccountProfile;
}

const Account = ({ account }: AccountProps) => {
  const { subscription, preferences } = account;

  const profileFields = [
    { label: "Name", value: account.guestName },
    { label: "Email", value: account.email },
    { label: "Member since", value: account.memberSince },
    { label: "Adventures completed", value: String(account.adventuresCompleted) },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="max-w-3xl mx-auto px-8 py-24 lg:py-32">
        <motion.div {...fade()}>
          <p className="label-text mb-8 tracking-[0.3em]">Your Account</p>
          <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.02] mb-8">
            The details.
          </h1>
        </motion.div>

        <div className="mt-16 space-y-20">
          {/* Subscription */}
          <motion.div {...fade(0.1)}>
            <p className="label-text mb-6 tracking-[0.25em]">Subscription</p>
            <div className="flex items-baseline justify-between border-b border-border pb-8">
              <div>
                <p className="font-display text-2xl text-foreground">{subscription.planName}</p>
                <p className="font-editorial text-sm text-muted-foreground mt-2">
                  {subscription.planDescription}
                </p>
              </div>
              <span className="label-text !text-gold capitalize">{subscription.status}</span>
            </div>
            <div className="mt-6 flex gap-8">
              <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                Manage plan
              </span>
              <span className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer">
                Billing history
              </span>
            </div>
          </motion.div>

          {/* Profile */}
          <motion.div {...fade(0.2)}>
            <p className="label-text mb-6 tracking-[0.25em]">Profile</p>
            <div className="space-y-6">
              {profileFields.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <p className="label-text">{item.label}</p>
                  <p className="font-editorial text-base text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                Edit profile
              </span>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div {...fade(0.3)}>
            <p className="label-text mb-6 tracking-[0.25em]">Preferences</p>
            <div className="space-y-6">
              {preferences.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <p className="label-text">{item.label}</p>
                  <p className="font-editorial text-sm text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-8 py-16">
        <div className="divider" />
      </footer>
    </div>
  );
};

export default Account;
