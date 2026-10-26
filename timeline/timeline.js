/* Timeline component. Usage:
 *
 *   <link rel="stylesheet" href="timeline/timeline.css">
 *   <div class="timeline" id="my-timeline"></div>
 *   <script src="timeline/timeline.js"></script>
 *   <script> Timeline.render(document.getElementById("my-timeline"), { tags, eras, periods, events }); </script>
 *
 * Data (dates are "YYYY-MM"; most recent is drawn at the top):
 *   tags:    { Name: "#colour", ... }              colours periods and events by their `tag`
 *   eras:    [{ start, end, title, url? }]          vertical label + bar along the rail (e.g. schools)
 *   periods: [{ start, end, title, url?, tag, desc? }]   boxes; end: null means "now"
 *            or [{ date, title, ... }]                    a one-month period: a single date mark, no start/end
 *   events:  [{ date, title, url?, tag, desc?, when? }]  labels on the right
 * Optional on any item: `when` (events, one-month periods) or `startWhen` / `endWhen` (eras, periods) to override the
 * date text, e.g. "Summer 2025" or "2021". `title` and `desc` may contain HTML; `url` links the title.
 *
 * Options: { gapPerMonth: 10, maxGap: 72 }. Vertical space between rows is gapPerMonth * (months
 * between them - 1) ^ 0.6, capped at maxGap px: back-to-back months touch, so things close in time
 * cluster, and longer gaps open up without the page being to scale.
 */
(function () {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const FALLBACK_COLOUR = "#a78bfa";
  // Same month: a period's end mark, then events, then a period's start mark.
  const KIND_ORDER = { end: 0, single: 1, event: 1, start: 2 };

  const thisMonth = () => new Date().toISOString().slice(0, 7);
  const toMonths = d => +d.slice(0, 4) * 12 + +d.slice(5, 7);
  const formatDate = d => d ? `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : "now";
  // An ongoing period (end: null) runs to this month, or to its start month if it hasn't started yet.
  const endOf = p => p.end || [thisMonth(), p.start].sort().pop();
  const duration = p => toMonths(endOf(p)) - toMonths(p.start);
  const startLabel = p => p.startWhen || formatDate(p.start);
  const endLabel = p => p.endWhen || formatDate(p.end);
  const singleLabel = p => p.when || formatDate(p.start);
  // A period given as { date } (or with start === end) lasts one month and gets a single row.
  const normalise = p => p.date && !p.start ? { ...p, start: p.date, end: p.date } : p;
  const isSingle = p => p.end === p.start;
  const linked = item => item.url ? `<a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>` : item.title;
  const descHtml = item => item.desc ? `<p>${item.desc}</p>` : "";
  const overlaps = (a, b) => a.from <= b.to && b.from <= a.to;

  // Marks: one per event, plus an end and a start mark for every era and period (one mark if it lasts a month).
  // Marks are grouped into rows: end marks share a row with whatever else falls in that month (one
  // event or one-month period), so the month gets a single date label. Start marks sit at the bottom
  // of their own row.
  function buildRows({ eras, periods, events }) {
    const marks = events.map(e => ({ date: e.date, kind: "event", item: e }));
    for (const p of [...eras, ...periods]) {
      if (isSingle(p)) marks.push({ date: p.start, kind: "single", item: p });
      else marks.push({ date: endOf(p), kind: "end", item: p }, { date: p.start, kind: "start", item: p });
    }
    marks.sort((a, b) => b.date.localeCompare(a.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

    const rows = [];
    for (const m of marks) {
      const last = rows[rows.length - 1];
      const joins = last && last.date === m.date && m.kind !== "start" && last.marks.every(x => x.kind === "end");
      if (joins) last.marks.push(m);
      else rows.push({ date: m.date, marks: [m] });
    }
    return rows;
  }

  // The row range a period or era covers, from its end row (top) to its start row (bottom), 1-based.
  function spanOf(rows, p) {
    const at = kind => rows.findIndex(r => r.marks.some(m => m.item === p && m.kind === kind)) + 1;
    if (isSingle(p)) return { item: p, from: at("single"), to: at("single") };
    return { item: p, from: at("end"), to: at("start") };
  }

  // Longer periods take lane 0; a shorter period overlapping one already placed goes in lane 1, on top.
  function assignLanes(spans) {
    const placed = [];
    for (const s of [...spans].sort((a, b) => duration(b.item) - duration(a.item))) {
      let lane = 0;
      while (placed.some(o => o.lane === lane && overlaps(o, s))) lane++;
      s.lane = Math.min(lane, 1);
      placed.push(s);
    }
  }

  function render(el, data, options = {}) {
    const { gapPerMonth = 6, maxGap = 72 } = options;
    const cfg = { tags: {}, eras: [], periods: [], events: [], ...data };
    cfg.eras = cfg.eras.map(normalise);
    cfg.periods = cfg.periods.map(normalise);
    const colourOf = tag => cfg.tags[tag] || FALLBACK_COLOUR;

    const rows = buildRows(cfg);
    const eraSpans = cfg.eras.map(p => spanOf(rows, p));
    const periodSpans = cfg.periods.map(p => spanOf(rows, p));
    assignLanes(periodSpans);

    // Grid: each row sits on an odd grid line, with a spacer track before it sized by the time gap.
    const line = row => 2 * row - 1;
    const rowSpan = s => `${line(s.from)} / ${line(s.to) + 1}`;
    const gap = (a, b) => Math.min(maxGap, gapPerMonth * Math.max(0, toMonths(a) - toMonths(b) - 1) ** 0.6);
    el.style.gridTemplateRows = rows
      .map((r, i) => i ? `${gap(rows[i - 1].date, r.date).toFixed(1)}px auto` : "auto")
      .join(" ");

    const boxTracks = periodSpans.some(s => s.lane) ? 2 : 1;
    const boxEnd = 4 + boxTracks, eventCol = 5 + boxTracks;
    el.style.gridTemplateColumns = "var(--tl-era-w) var(--tl-when-w) var(--tl-rail-w) " +
      `repeat(${boxTracks}, var(--tl-box-w)) var(--tl-gutter) var(--tl-event-w)`;

    const eraHtml = s => `
      <div class="tl-era-label" style="grid-row:${rowSpan(s)}">${linked(s.item)}</div>
      <div class="tl-era-bar" style="grid-row:${rowSpan(s)}"></div>`;

    const periodHtml = s => {
      const p = s.item, c = colourOf(p.tag);
      const overlapped = periodSpans.some(o => o.lane > s.lane && overlaps(o, s));
      const dates = isSingle(p) ? singleLabel(p) : `${startLabel(p)} – ${endLabel(p)}`;
      return `${isSingle(p) ? "" : `
      <div class="tl-bracket" style="--c:${c};grid-row:${rowSpan(s)}"></div>`}
      <div class="tl-period tl-lane-${s.lane}${overlapped ? " tl-has-overlap" : ""}"
           style="--c:${c};grid-column:${4 + s.lane} / ${boxEnd};grid-row:${rowSpan(s)}">
        <div class="tl-period-inner">
          <span class="tl-date-m">${dates}</span>
          <h3>${linked(p)}</h3>${p.tag ? `<span class="tl-tag">${p.tag}</span>` : ""}
          ${descHtml(p)}
        </div>
      </div>`;
    };

    const eventHtml = (e, row) => {
      const c = colourOf(e.tag), when = e.when || formatDate(e.date), r = line(row);
      return `
      <div class="tl-dot" style="--c:${c};grid-row:${r}"></div>
      <div class="tl-leader" style="--c:${c};grid-column-end:${eventCol};grid-row:${r}"></div>
      <div class="tl-event" style="--c:${c};grid-column:${eventCol};grid-row:${r}">
        <span class="tl-date-m">${when}</span>
        <h4>${linked(e)}</h4>${e.tag ? `<span class="tl-tag">${e.tag}</span>` : ""}
        ${descHtml(e)}
      </div>`;
    };

    const markColour = m => cfg.eras.includes(m.item) ? "var(--tl-era-c)" : colourOf(m.item.tag);
    const markLabel = m => ({
      event: () => m.item.when || formatDate(m.item.date),
      single: () => singleLabel(m.item),
      end: () => endLabel(m.item),
      start: () => startLabel(m.item),
    })[m.kind]();

    // Period end marks sit at the top of their row, start marks at the bottom, so the box fits between.
    // A one-month period has a single mark at the top.
    const tickHtml = (m, row) => {
      const pos = m.kind === "start" ? " tl-at-bottom" : "";
      const era = cfg.eras.includes(m.item) ? " tl-era-tick" : "";
      return `
      <div class="tl-tick${pos}${era}" style="--c:${markColour(m)};grid-row:${line(row)}"></div>`;
    };

    // One date label per row. Period starts/ends win, so a boundary stays bold even when it shares a
    // month with an event.
    const labelMark = r => r.marks.find(x => x.kind === "end" || x.kind === "start") || r.marks[0];

    // Skipped when the row above shows the same text for the same month.
    const labelHtml = (r, row, prev) => {
      const m = labelMark(r);
      if (prev && prev.date === r.date && markLabel(labelMark(prev)) === markLabel(m)) return "";
      const cls = m.kind === "event" ? "" : m.kind === "start" ? " tl-mark tl-at-bottom" : " tl-mark";
      const colour = m.kind === "event" ? "" : `--c:${markColour(m)};`;
      return `
      <div class="tl-when${cls}" style="${colour}grid-row:${line(row)}">${markLabel(m)}</div>`;
    };

    // Emit in row order so the stacked mobile layout reads top to bottom.
    let html = "";
    rows.forEach((r, i) => {
      const row = i + 1;
      eraSpans.filter(s => s.from === row).forEach(s => { html += eraHtml(s); });
      periodSpans.filter(s => s.from === row).sort((a, b) => a.lane - b.lane).forEach(s => { html += periodHtml(s); });
      html += labelHtml(r, row, rows[i - 1]);
      r.marks.forEach(m => { html += m.kind === "event" ? eventHtml(m.item, row) : tickHtml(m, row); });
    });
    el.innerHTML = html;
  }

  window.Timeline = { render };
})();
