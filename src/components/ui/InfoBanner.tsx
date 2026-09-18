export function InfoBanner() {
  return (
    <div role="note" aria-label="Legal information notice"
      className="w-full bg-[#F08A24]/10 border-b border-[#F08A24]/30 py-2 px-4">
      <p className="text-center text-xs font-mono text-[#F08A24] tracking-wide">
        <strong>INFORMATION, NOT LEGAL ADVICE.</strong>{" "}
        Clause & Effect helps you understand documents — it is not a lawyer and cannot give legal advice.
        Always consult a qualified legal professional before making legal decisions.
      </p>
    </div>
  );
}
