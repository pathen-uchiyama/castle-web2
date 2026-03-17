import { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

interface SmsOptInCheckboxProps {
  onOptIn: (agreed: boolean) => void;
  isOptedIn?: boolean;
}

const SmsOptInCheckbox = ({ onOptIn, isOptedIn = false }: SmsOptInCheckboxProps) => {
  const [checked, setChecked] = useState(isOptedIn);

  const handleChange = (val: boolean | "indeterminate") => {
    const next = val === true;
    setChecked(next);
    onOptIn(next);
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <Checkbox
        id="sms-opt-in"
        checked={checked}
        onCheckedChange={handleChange}
        className="mt-0.5 h-5 w-5 rounded border-2 border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:text-background data-[state=checked]:border-foreground"
      />
      <label htmlFor="sms-opt-in" className="cursor-pointer">
        <p className="font-editorial text-sm text-foreground leading-relaxed">
          I agree to receive text messages from Castle Companion, LLC at the number provided.{" "}
          <Link to="/terms#sms" className="text-[hsl(var(--lavender))] hover:underline font-medium">
            Terms &amp; SMS Policy
          </Link>
        </p>
        <p className="font-editorial text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Msg &amp; data rates may apply. Reply STOP to unsubscribe. Consent is not a condition of purchase.
        </p>
      </label>
    </div>
  );
};

export default SmsOptInCheckbox;
