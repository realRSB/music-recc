import { CircleAlert, X } from "lucide-react";

type AuthNoticeProps = {
  message: string;
  onDismiss: () => void;
};

/* Auth failures arrive as a redirect to /?error=..., which means the user is
   sitting at the top of the page when it happens. The recommendation error
   banner lives down in the results section, so it would never be seen —
   hence a separate notice pinned under the nav. */
export default function AuthNotice({ message, onDismiss }: AuthNoticeProps) {
  return (
    <div
      role="alert"
      className="fixed top-[68px] sm:top-[76px] left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-md"
    >
      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl border border-red-400/40 bg-red-950/85 backdrop-blur-md text-red-100 text-sm shadow-lg shadow-black/40">
        <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-red-300" />
        <p className="flex-1 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 grid place-items-center w-6 h-6 rounded-full text-red-200/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
