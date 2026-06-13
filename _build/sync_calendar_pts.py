#!/usr/bin/env python3
"""Sync Page to Stage events into calendar-events.json.
Idempotent: clears prior show=='page-to-stage' entries and rebuilds from events.json.
Run whenever _build/events.json changes (it's part of the Page to Stage build pipeline)."""
import json, re, datetime, pathlib

DEPLOY = pathlib.Path("/home/claude/site/deploy")
CAL = DEPLOY / "calendar-events.json"
EVENTS = json.load(open("_build/events.json"))

PTS_SLUG = "page-to-stage"
PTS_COLOR = "#2f5d6b"   # distinct slate-teal for the Page to Stage program

MON = {m:i for i,m in enumerate(
    ["january","february","march","april","may","june","july","august",
     "september","october","november","december"],1)}

def parse_iso(s):
    """Find a 'Month DD, YYYY' inside a free-text string -> 'YYYY-MM-DD', else None."""
    if not s: return None
    m = re.search(r'([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})', s)
    if not m: return None
    mon = MON.get(m.group(1).lower())
    if not mon: return None
    return f"{int(m.group(3)):04d}-{mon:02d}-{int(m.group(2)):02d}"

cal = json.load(open(CAL))
cal.setdefault("shows", {})
cal.setdefault("events", [])

# 1) ensure the Page to Stage program show exists (single color + legend entry)
cal["shows"][PTS_SLUG] = {
    "name": "Page to Stage",
    "program": "Page to Stage",
    "color": PTS_COLOR,
    "thumb": None,
}

# 2) drop any previously-synced PtS events (idempotent)
cal["events"] = [e for e in cal["events"] if e.get("show") != PTS_SLUG]

added, skipped = [], []
for e in EVENTS:
    title = e["title"]
    venue = e["venue"] + (f" \u00b7 {e['city']}" if e.get("city") else "")
    perf_iso = e.get("iso") or None
    wk_iso = parse_iso(e.get("workshop"))
    if not perf_iso and not wk_iso:
        skipped.append((e["slug"], e.get("when_card") or "TBD"))
        continue
    # Workshop session
    if wk_iso:
        cal["events"].append({
            "show": PTS_SLUG, "type": "Workshop",
            "title": f"{title} \u2014 workshop",
            "start": wk_iso, "end": None, "time": None,
            "note": f"Page to Stage workshop \u00b7 {venue}",
        })
    # Live-theater trip
    if perf_iso:
        cal["events"].append({
            "show": PTS_SLUG, "type": "Page to Stage",
            "title": f"{title} \u2014 live show",
            "start": perf_iso, "end": None, "time": None,
            "note": f"Page to Stage trip to see {title} \u00b7 {venue}",
        })
    added.append(e["slug"])

# keep events tidy by date
cal["events"].sort(key=lambda x: (x["start"], x["type"]))
cal["generated"] = datetime.date.today().isoformat()

json.dump(cal, open(CAL, "w"), indent=2, ensure_ascii=False)
print("Page to Stage events synced to calendar.")
print("  added trips:", len(added), "->", ", ".join(added))
print("  skipped (no firm date):", len(skipped), "->", ", ".join(f"{s}({w})" for s,w in skipped))
pts_total = sum(1 for e in cal["events"] if e["show"]==PTS_SLUG)
print("  PtS calendar entries now:", pts_total, "| total calendar events:", len(cal["events"]))
