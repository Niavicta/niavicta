/* Niavicta · FAQ content (single source of truth, dependency-free)
   Powers the search on faq.html and the full library on
   all-questions.html. Each item carries `aliases`: alternate
   phrasings of the same question so search matches however a person asks.
   Answers are curated to the public site voice. Internal / unverified /
   legally-flagged items from the question bank are deliberately excluded. */
(function () {
  window.NIANAV_FAQ_CATS = [
    ['basics', 'The basics'],
    ['start', 'Getting started'],
    ['how', 'How it works'],
    ['evidence', 'Evidence & audit'],
    ['ai', 'AI governance'],
    ['compliance', 'Compliance & scope'],
    ['security', 'Security & data'],
    ['integrations', 'Integrations'],
  ];

  window.NIANAV_FAQ = [
    // ── Featured (the "most asked", shown on the FAQ page) ─────────────
    { cat: 'basics', featured: true, q: 'What is nianav OS?',
      aliases: ['What is nianav OS in one sentence?', 'What does nianav OS do?'],
      a: `nianav&nbsp;OS is an operating system for regulated startups. It gives teams one connected place to run procedures, assign work, capture evidence, manage records, and see what is happening across the company.` },

    { cat: 'basics', featured: true, q: 'Who is it for?',
      aliases: ['Who uses nianav OS?', 'Is this for my company?'],
      a: `It is built for startups and scaleups in regulated industries, especially medtech, health AI, biotech, and other companies where evidence, traceability, quality, and audit readiness matter from the beginning.` },

    { cat: 'basics', featured: true, q: 'Why do regulated startups need something different?',
      aliases: ["Why can't we use normal startup tools?", 'Why is a regulated company different?'],
      a: `Starting a regulated company is not like starting a normal company. There are rules to the game, and many founders only discover them when something becomes expensive: an audit, a submission, a clinical milestone, an investor diligence process, or a quality issue. <b>nianav&nbsp;OS puts the scaffolding in place earlier</b>, so the company grows with structure instead of rebuilding it later.` },

    { cat: 'compliance', featured: true, q: 'Does nianav OS make my company compliant?',
      aliases: ['Will this make us compliant?', 'Does the software make us compliant?'],
      a: `No software can honestly promise that on its own. Compliance still depends on the company, the product, the decisions made, and the evidence produced. What nianav&nbsp;OS does is make the work easier to structure, trace, review, and prove, so teams operate in a way that supports compliance instead of scrambling to reconstruct it afterwards.` },

    { cat: 'basics', featured: true, q: 'What problem does it solve first?',
      aliases: ['What is the first thing it fixes?', 'What pain does it solve first?'],
      a: `It solves the fragmentation problem. In many regulated startups, procedures live in documents, evidence lives in folders, decisions live in email, tasks live in project tools, and knowledge lives in people's heads. <b>nianav&nbsp;OS connects the work to the evidence as it happens.</b>` },

    { cat: 'basics', featured: true, q: 'Is this a QMS?',
      aliases: ['Is nianav OS a quality management system?', 'Is this an ERP or PLM?', 'What category of software is this?'],
      a: `It includes important QMS capabilities, but it is broader than a traditional QMS. nianav&nbsp;OS is designed as an operational fabric: quality, operations, projects, training, change control, compliance evidence, and AI governance all run from the same connected system.` },

    { cat: 'basics', featured: true, q: 'Why not just use spreadsheets, SharePoint, Notion, or project tools?',
      aliases: ['Why not Notion or spreadsheets?', 'Why not SharePoint?', 'Why not our existing tools?'],
      a: `Those tools can work early on, but they usually become stressful as the company grows. They do not naturally know which procedure created which record, who approved what, what evidence supports a requirement, or whether the latest version of the process is actually being followed. nianav&nbsp;OS is built around those relationships from the start.` },

    { cat: 'start', featured: true, q: 'What is Project Zero?',
      aliases: ['How does onboarding work?', 'How do we get started?', 'What is the setup process?'],
      a: `Project Zero is the setup process that helps a new company get its operating scaffold in place. Instead of starting from a blank system, the company is guided through the procedures, records, roles, and regulatory scope it needs to begin operating in a more controlled way.` },

    { cat: 'start', featured: true, q: 'When should a startup start thinking about this?',
      aliases: ['When is the right time to start?', 'How early should we set this up?'],
      a: `Earlier than most teams expect. The best time is before the company has accumulated months of undocumented decisions, scattered evidence, and informal workarounds. If clinical work, product development, quality processes, AI use, supplier work, or regulatory submissions are on the horizon, the structure should already be forming.` },

    { cat: 'evidence', featured: true, q: 'How does this help with clinical or product evidence?',
      aliases: ['How does it help with evidence?', 'How does it help clinical evidence?'],
      a: `It helps by linking evidence to the work that produced it. Requirements, risks, tests, decisions, reviews, changes, and records can be connected instead of stored as separate fragments. That makes it easier to understand what has been done, what still needs proof, and what can be shown during review or audit.` },

    { cat: 'integrations', featured: true, q: 'Does this replace specialist tools?',
      aliases: ['Does nianav OS replace GitHub, CAD, DocuSign, or Microsoft 365?', 'What stays specialist?', 'Do we keep our specialist tools?'],
      a: `Not always. Some specialist tools should stay specialist: CAD, GitHub, Microsoft 365, e-signature tools, lab systems, or other domain-specific platforms may remain external. nianav&nbsp;OS connects the operating and evidence layer around them, so the company can still understand the full picture.` },

    { cat: 'ai', featured: true, q: 'How does nianav OS handle AI?',
      aliases: ['How is AI governed?', 'How do you handle AI safely?'],
      a: `nianav&nbsp;OS treats AI as something that needs governance, not as a magic feature. AI-assisted work should have a defined scope, a responsible human, version control, evidence, and an audit trail, because regulated companies need to know not only what AI produced, but how it was used and who was accountable.` },

    { cat: 'how', featured: true, q: 'Will this add more work for the team?',
      aliases: ['Does this create more work?', 'Is this extra overhead?'],
      a: `The goal is the opposite. Regulated work already exists; the question is whether it is captured clearly or reconstructed under pressure later. <b>nianav&nbsp;OS makes the right way the easier way</b>, so evidence is created during normal work rather than as a separate panic project before an audit.` },

    { cat: 'basics', featured: true, q: 'Why did Niavicta build this?',
      aliases: ['Who built nianav OS and why?', 'What is the origin?'],
      a: `Niavicta was started by two compliance professionals with two and a half decades of experience across medtech and regulated industries. They kept seeing the same avoidable setbacks: good teams, good ideas, but disconnected systems and late evidence. nianav&nbsp;OS was built to give founders a clearer path from day one, so regulation becomes less of a hidden burden and more of a lever for getting strong products to market.` },

    // ── Library (the full set, browseable by category + search) ────────
    { cat: 'basics', q: 'What kind of software does nianav OS replace?',
      aliases: ['What workflow tools does it replace?', 'What does it consolidate?'],
      a: `nianav&nbsp;OS aims to replace tools whose value is mostly workflow: quality systems, ERP-style workflow, HR processes, ticketing, project management, supplier qualification, training, change control, and support. The specialist engines underneath stay where they are.` },

    { cat: 'basics', q: 'What does nianav OS deliberately not replace?',
      aliases: ['What stays outside the system?', 'What does it not try to do?'],
      a: `Specialist tools stay specialist. nianav&nbsp;OS covers the workflow around them, not the engine itself, and connects to them so the company still sees the full picture.` },

    { cat: 'start', q: 'What does Project Zero set up for us?',
      aliases: ['What does Project Zero produce?', 'What do you get from Project Zero?'],
      a: `Project Zero installs your starting operating scaffold: an initial set of procedures, your org structure, your declared regulatory scope, and the first version of your quality manual. You begin from a configured system instead of a blank page.` },

    { cat: 'start', q: 'Can a non-regulated company use nianav OS?',
      aliases: ['Is Project Zero only for regulated companies?', 'Does it work for non-regulated teams?'],
      a: `Yes. The workflow structure works for any process-driven company. The compliance machinery only switches on for the standards you declare, so a non-regulated team gets the rigor without claiming a framework it does not need.` },

    { cat: 'how', q: 'How does nianav OS know who is allowed to do a task?',
      aliases: ['How does it decide who can do what?', 'Who is allowed to perform a step?'],
      a: `It keeps roles, capabilities, training, and assignments separate. Work is assigned only when the person has the right role and the evidence that they can do that kind of task.` },

    { cat: 'how', q: 'Are job titles enough to assign regulated work?',
      aliases: ['Why capabilities instead of roles?', 'Are roles enough to assign work?'],
      a: `No. Regulated work needs evidence that a person can perform a specific task, not just a title. nianav&nbsp;OS tracks capabilities separately from job titles for exactly that reason.` },

    { cat: 'how', q: 'Are the procedures fixed by Niavicta, or can we change them?',
      aliases: ['Can we customise the templates?', 'Are templates locked or editable?'],
      a: `You can adapt them. Templates are customisable within sensible limits, and every change runs through change control, so the workflow stays versioned and traceable instead of being edited in the dark.` },

    { cat: 'how', q: 'What happens when a procedure changes?',
      aliases: ['How are procedure changes governed?', 'How do you handle changing a process?'],
      a: `The change runs through your change control process as a tracked record. You can see what changed, who approved it, and why.` },

    { cat: 'how', q: 'Are records created through procedures, or ad hoc?',
      aliases: ['Does every record come from a procedure?', 'Can people create records outside a process?'],
      a: `Records are anchored to the procedure that created them. That link is what lets you trace any record back to the work and the decision behind it.` },

    { cat: 'how', q: 'What actually happens when someone completes a step?',
      aliases: ['Does finishing a step create evidence automatically?', 'What gets recorded when a step is done?'],
      a: `The work creates its own record as it moves. Completing a step captures what was done and connects it to the procedure, so the evidence builds itself instead of being written up later.` },

    { cat: 'evidence', q: 'What can we actually show during an audit?',
      aliases: ['What evidence package can we show an auditor?', 'What can an auditor see?'],
      a: `A connected evidence picture: your live quality manual, the records produced by work, and the traceability between requirements, risks, controls, and proof. Because the work created the records as it happened, the trail is already there.` },

    { cat: 'evidence', q: 'How do user needs connect to requirements, risks, and tests?',
      aliases: ['How does traceability work?', 'How do requirements connect to tests and risks?'],
      a: `They are linked. User needs connect to system requirements, risks, controls, and test cases, so you can follow any thread from intention to proof, and see where coverage is still missing.` },

    { cat: 'evidence', q: 'Is the quality manual a static PDF or a live thing?',
      aliases: ['Is the Quality Manual a PDF?', 'Is the quality manual a living document?'],
      a: `It is live. The quality manual is built from the real records underneath it, and you can take a sealed snapshot for a point in time when you need fixed evidence.` },

    { cat: 'evidence', q: 'Can audit history be edited or deleted after the fact?',
      aliases: ['Can someone change the audit log?', 'Is the audit trail immutable?'],
      a: `No. Sealed audit records cannot be changed or removed. The history is append-only and tamper-evident by design.` },

    { cat: 'ai', q: 'How are AI agents represented in nianav OS?',
      aliases: ['Are AI agents users or just tools?', 'How does the system model AI agents?'],
      a: `As part of the workforce, not as hidden automation. AI agents sit in the org chart alongside people, hold capabilities, take assignments, and are versioned so their work can be validated and audited.` },

    { cat: 'ai', q: 'Can AI act without a named human being accountable?',
      aliases: ['Is a human always accountable for AI?', 'Does AI work always have a responsible person?'],
      a: `No. Whenever a step involves AI or hybrid work, a named human, the Human Principal, is accountable for it. Purely human work does not need one.` },

    { cat: 'ai', q: 'Can we bring our own AI agents?',
      aliases: ['Are AI agents Niavicta-built or ours?', 'Can we add our own AI agents?'],
      a: `At launch, AI agents are built and validated by Niavicta. You activate the ones you need and assign your own oversight. Bringing your own agents is planned for later.` },

    { cat: 'ai', q: 'Can AI agents hold capabilities like people do?',
      aliases: ['Do AI agents have capabilities?', 'How are AI capabilities proven versus human ones?'],
      a: `Yes, the same idea of a capability applies to both. The difference is the evidence: people show training or prior credentials, while AI agents rely on validation-test evidence, especially for higher-risk work.` },

    { cat: 'compliance', q: 'How does nianav OS know which regulations apply to us?',
      aliases: ['How is our regulatory scope set?', 'How does it know our standards?'],
      a: `You declare your regulatory scope during Project Zero, and keep it current through a controlled amendment process as your markets, product, or standards change.` },

    { cat: 'compliance', q: 'What happens when a regulation changes after we are set up?',
      aliases: ['What if a standard changes later?', 'How are regulatory updates handled?'],
      a: `A regulatory change becomes an impact assessment for the companies it affects, then flows through to the specific templates and records that need to update. The change is traced, not guessed.` },

    { cat: 'compliance', q: 'Does nianav OS give legal or regulatory advice?',
      aliases: ['Is this legal advice?', 'Does it replace a notified body or auditor?'],
      a: `No. nianav&nbsp;OS maps obligations into workflows and captures evidence, but it is not a substitute for a regulator, notified body, auditor, or qualified advisor. Responsibility for compliance stays with your company and its advisors.` },

    { cat: 'security', q: "How do you keep one customer's data separate from another's?",
      aliases: ['How do you prevent data leaking between customers?', 'Is my data separated from other companies?'],
      a: `Every company's data is isolated. People only see their own company's records, and the few cross-company workflows that exist are opened by explicit relationships and grants, never by default.` },

    { cat: 'security', q: "Can one company see another company's org chart?",
      aliases: ['Can other companies see our people?', 'Is the org chart shared between companies?'],
      a: `No. There is no shared directory across companies. People become visible across a boundary only through an explicit relationship for specific shared work.` },

    { cat: 'integrations', q: 'What does nianav OS connect to today?',
      aliases: ['What does it integrate with?', 'Which systems does it connect to?'],
      a: `It connects to the specialist tools around it. Today that includes Microsoft 365 calendar and meetings, with more connectors on the roadmap. The aim is to govern the workflow around your specialist tools, not to rip them out.` },
  ];
})();
