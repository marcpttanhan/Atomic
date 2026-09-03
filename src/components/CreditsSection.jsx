const REFERENCES = [
  'หลักสูตรและตัวชี้วัดกลุ่มสาระการเรียนรู้วิทยาศาสตร์ (เคมี) สสวท.',
  'ข้อสอบคัดเลือกนักเรียนเข้าค่าย สอวน. วิชาเคมี (มูลนิธิ สอวน.)',
  'ข้อสอบวัดความรู้ความถนัด A-Level วิชาเคมี (ทปอ.)',
];

export default function CreditsSection() {
  return (
    <section
      aria-label="คณะผู้จัดทำและแหล่งอ้างอิง"
      className="rounded-2xl border border-divider bg-surface/70 p-6 backdrop-blur-md"
    >
      <div className="font-heading text-lg font-bold text-ink">คณะผู้จัดทำ &amp; แหล่งอ้างอิง</div>

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">คณะผู้จัดทำ (Project Creator)</div>
        <div className="mt-1.5 text-sm text-ink">
          <span className="font-semibold">Phathraphon Tanhan</span> — Project Creator &amp; System Architect
          <span className="text-neutral-600"> (AI-Assisted Development, Game Logic Design &amp; Content Curation)</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">แหล่งข้อมูลอ้างอิง (Academic References)</div>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-neutral-700">
          {REFERENCES.map((ref) => (
            <li key={ref}>{ref}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
