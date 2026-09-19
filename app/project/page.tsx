import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BrainCircuit, Compass, FlaskConical, Gem, Hammer, Layers3, Palette, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { requireUser } from '@/lib/auth';

const people = [
  {
    name: 'Jony Ive',
    role: 'Design Leadership',
    focus: 'Product · Experience · Object thinking',
    kind: 'Aspirational leadership simulation',
    icon: Palette,
    prompt: 'Does the technology get out of the way of the object?',
    note: 'Conceptual role only. This prototype does not claim affiliation, participation, endorsement or advice from Jony Ive.',
  },
  {
    name: 'Amaar Reshi',
    role: 'AI & Creative Technology Leadership',
    focus: 'AI · Prototyping · Creative systems',
    kind: 'Aspirational leadership simulation',
    icon: BrainCircuit,
    prompt: 'What becomes possible if AI understands the object, rather than simply describing it?',
    note: 'Conceptual role only. This prototype does not claim affiliation, participation, endorsement or advice from Amaar Reshi.',
  },
  {
    name: 'Lee',
    role: 'Product & Provenance Architecture',
    focus: 'Vision · Provenance · Digital systems',
    kind: 'Project role',
    icon: Compass,
    prompt: 'What evidence makes the digital object worthy of trust?',
    note: 'Project role represented for the prototype.',
  },
  {
    name: 'Matt',
    role: 'Field Operations & Physical Objects',
    focus: 'Capture · Handling · Practical workflow',
    kind: 'Project role',
    icon: Hammer,
    prompt: 'Can the workflow actually work while handling a real stone?',
    note: 'Project role represented for the prototype.',
  },
  {
    name: 'Professor Nigel Spooner',
    role: 'Scientific Advisor',
    focus: 'Scientific methodology · Analysis · Validation',
    kind: 'Advisory role',
    icon: FlaskConical,
    prompt: 'Which observations can be measured, reproduced and independently validated?',
    note: 'Scientific role represented for the prototype; unresolved questions should remain explicitly unresolved.',
  },
  {
    name: 'Danielle Spooner',
    role: 'Geological & Earth Science Advisor',
    focus: 'Geology · Sedimentary context · Interpretation',
    kind: 'Advisory role',
    icon: Layers3,
    prompt: 'What geological context helps explain the object without turning interpretation into false certainty?',
    note: 'Geological role represented for the prototype.',
  },
];

export default async function ProjectPage() {
  await requireUser();
  return (
    <div className="pb-16">
      <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-[#9a9288] hover:text-white"><ArrowLeft size={15} /> Back to Digital Twins</Link>
      <div className="mb-10 max-w-4xl">
        <div className="mb-label">Project room</div>
        <h1 className="mb-display mt-3 text-4xl md:text-6xl">A real object. A real team. A real test.</h1>
        <p className="mt-5 text-base leading-8 text-[#9a9288]">This project room gives the Digital Twin prototype a human context: physical capture, design, AI, science, geology and provenance all pull on the same object from different directions.</p>
      </div>

      <section className="mb-panel rounded-2xl p-6 md:p-8">
        <div className="mb-label">Leadership & roles</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => <PersonCard key={person.name} person={person} />)}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="mb-panel rounded-2xl p-6 md:p-8">
          <div className="mb-label">Decision room</div>
          <h2 className="mt-2 text-2xl font-medium">The first product decisions</h2>
          <div className="mt-7 space-y-5">
            <Decision title="Capture simplicity vs. capture completeness" summary="Matt needs a workflow that works in the field. The system needs enough images to reconstruct the object reliably." people="Field Operations · Design · AI" />
            <Decision title="Evidence vs. interpretation" summary="The app must separate original source material from AI-generated or human-interpreted conclusions." people="Science · Geology · Provenance" />
            <Decision title="Beauty vs. instrument" summary="The viewer should make the stone compelling without turning a scientific record into a marketing render." people="Design · Product · Science" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#c9a66b]/20 bg-[#c9a66b]/[.045] p-6 md:p-8">
          <div className="mb-label text-[#c9a66b]">The stake</div>
          <h2 className="mt-2 text-2xl font-medium">Can one real stone cross the physical-digital boundary without losing its truth?</h2>
          <p className="mt-5 text-sm leading-7 text-[#cfc7bd]">Version 0.1 succeeds when a real Andamooka matrix opal can be photographed, preserved, reconstructed, displayed and linked back to its evidence.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Stake icon={ShieldCheck} title="Authenticity" text="Keep source evidence intact." />
            <Stake icon={Sparkles} title="Usefulness" text="Make the twin easy to inspect." />
            <Stake icon={FlaskConical} title="Science" text="Separate evidence from inference." />
            <Stake icon={Gem} title="Identity" text="Give the object a persistent ID." />
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonCard({ person }: { person: typeof people[number] }) {
  const Icon = person.icon;
  const aspirational = person.kind.includes('Aspirational');
  return <div className="rounded-2xl border border-white/10 bg-black/15 p-5"><div className="flex items-start justify-between gap-4"><div className="grid h-10 w-10 place-items-center rounded-full border border-[#c9a66b]/20 bg-[#c9a66b]/5"><Icon size={17} className="text-[#c9a66b]" /></div><span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[.12em] ${aspirational ? 'bg-[#c9a66b]/10 text-[#c9a66b]' : 'bg-white/5 text-[#9a9288]'}`}>{aspirational ? 'Simulation' : person.kind}</span></div><h3 className="mt-5 text-xl font-medium">{person.name}</h3><div className="mt-1 text-sm text-[#c9a66b]">{person.role}</div><div className="mt-3 text-xs uppercase tracking-[.1em] text-[#6f675f]">{person.focus}</div><div className="mt-5 rounded-xl bg-white/[.025] p-4 text-sm leading-6 text-[#cfc7bd]">“{person.prompt}”</div><p className="mt-4 text-[11px] leading-5 text-[#6f675f]">{person.note}</p></div>;
}

function Decision({ title, summary, people }: { title: string; summary: string; people: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/15 p-5"><div className="flex items-start gap-3"><UsersRound size={16} className="mt-0.5 shrink-0 text-[#c9a66b]" /><div><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-[#9a9288]">{summary}</p><div className="mt-3 text-[10px] uppercase tracking-[.12em] text-[#6f675f]">{people}</div></div></div></div>;
}

function Stake({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/15 p-4"><Icon size={15} className="text-[#c9a66b]" /><div className="mt-3 text-sm font-medium">{title}</div><div className="mt-1 text-xs leading-5 text-[#9a9288]">{text}</div></div>;
}
