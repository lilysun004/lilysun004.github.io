// Life Story timeline on the About tab. Order doesn't matter: everything is sorted by date.
// Copy a line into the right list (dates are "YYYY-MM"; url, desc and the *When overrides are optional):
//   eras:    { start: "2023-09", end: "2026-05", title: "MIT", url: "https://..." },
//   periods: { start: "2025-06", end: "2025-08", tag: "Research", title: "MATS", url: "https://...", desc: "..." },
//            (end: null means "now"; startWhen / endWhen: "Summer 2025" override the date text)
//            { date: "2023-07", tag: "Event", title: "...", desc: "..." }  is a one-month period (single date mark)
//   events:  { date: "2022-07", tag: "Award", title: "IPhO 2022", url: "https://...", desc: "..." },
//            (when: "20XX" overrides the date text)
// New tag? Add it to `tags` with a colour. Full format notes are at the top of timeline.js.
Timeline.render(document.getElementById("life-timeline"), {
  tags: { Award: "#fbbf24", Research: "#c084fc", Event: "#f87171", Work: "#34d399" },

  eras: [
    { start: "2023-09", end: "2026-05", title: "MIT (BS Physics)", url: "https://www.mit.edu/" },
    { start: "2021-01", end: "2022-12", title: "Raffles Institution", url: "https://en.wikipedia.org/wiki/Raffles_Institution" },
  ],

  periods: [
    { start: "2026-11", end: null, tag: "Research",
      title: "Anthropic Fellow", url: "https://alignment.anthropic.com/2025/anthropic-fellows-program-2026/",
      desc: "Safety research." },
    { start: "2026-10", end: "2026-10", tag: "Work",
      title: "OneTriangle", url: "https://onetriangle.ai/",
      desc: "Making inference fast at my friends' startup."},
    { start: "2026-06", end: "2026-08", tag: "Work",
      title: "Jump Trading", url: "https://www.jumptrading.com/",
      desc: "Quantitative research intern, options & equities." },
    { start: "2025-06", end: "2025-08", tag: "Research",
      title: "MATS 8.0", url: "https://www.matsprogram.org/",
      desc: 'Interpretability research mentored by <a href="https://www.neelnanda.io/about" target="_blank" rel="noopener">Neel Nanda</a>. 10/10 program.' },
    { start: "2024-06", end: "2024-08", tag: "Research",
      title: "MISTI Italy", url: "https://misti.mit.edu/italy",
      desc: "Astrophysics research at the University of Pisa." },
  ],

  events: [
    { date: "2026-05", tag: "Event", title: "Decided to graduate a year early",
      desc: 'so I can do more things' },
    { date: "2024-09", tag: "Research", title: "Started AI safety research",
      desc: 'with my GOAT advisor <a href="https://en.wikipedia.org/wiki/Max_Tegmark" target="_blank" rel="noopener">Max Tegmark</a>.' },
    { date: "2023-07", tag: "Event", title: "Atlas Fellowship", url: "https://www.atlasfellowship.org/",
      desc: "Life-changing camp." },
    { date: "2022-12", tag: "Event", title: "Stockholm International Youth Science Seminar",
      url: "https://www.worldscientific.com/pressroom/2023-02-06-01?srsltid=AfmBOorbpri2evJVSOr2mgATui53g8NbyQG8SZOhJV1AzMnp-0rXglCF",
      desc: "Got to attend the Nobel Prize Ceremony!!" },
    { date: "2022-08", tag: "Award", title: "International Olympiad on Astronomy & Astrophysics",
      url: "https://astronomy.sg/singapore-astronomy-olympiad/ioaa-singapore-hall-of-fame/", desc: "Gold, 8th" },
    { date: "2022-07", tag: "Award", title: "International Physics Olympiad",
      url: "https://ipho-unofficial.org/countries/SGP/individual", desc: "Silver" },
    { date: "2021-08", tag: "Award", title: "International Olympiad on Astronomy & Astrophysics",
      url: "https://astronomy.sg/singapore-astronomy-olympiad/ioaa-singapore-hall-of-fame/", desc: "Gold" },
    { date: "2021-07", tag: "Award",
      title: "International Young Physicists' Tournament", url: "https://en.wikipedia.org/wiki/International_Young_Physicists%27_Tournament",
      desc: 'Champions (<a href="https://cc.iypt.org/oypt2021/" target="_blank" rel="noopener">online</a>)' },
  ],
});
