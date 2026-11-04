import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatPeriod, fullName } from "@/lib/utils";
import { contactItems, docMeta, skillGroups, type TemplateProps } from "../shared";

/**
 * Moderno: tinted sidebar for contacts, skills with level dots, languages and
 * education; the main column carries profile and a railed experience list.
 */
const INK = "#191b2e";
const MUTED = "#5f6380";
const ACCENT = "#5b56e8";
const SIDE_BG = "#f1f0fb";
const SIDE_W = 182;

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 46, flexDirection: "row", fontFamily: "Geist", fontSize: 8.9, color: INK, lineHeight: 1.5 },
  sideBg: { position: "absolute", top: 0, left: 0, bottom: 0, width: SIDE_W, backgroundColor: SIDE_BG },
  side: { width: SIDE_W, paddingHorizontal: 22 },
  main: { flex: 1, paddingLeft: 30, paddingRight: 36 },
  mono: { width: 46, height: 46, borderRadius: 23, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  monoText: { color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 },
  sideH: { fontWeight: 600, fontSize: 9.5, color: ACCENT, marginTop: 20, marginBottom: 7 },
  sideItem: { marginBottom: 4, fontSize: 8.4 },
  sideLink: { color: INK, textDecoration: "none" },
  skillCat: { fontWeight: 600, fontSize: 8, color: MUTED, marginTop: 6, marginBottom: 3 },
  skill: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2.5, fontSize: 8.3 },
  dots: { flexDirection: "row", gap: 2 },
  dot: { width: 4.5, height: 4.5, borderRadius: 2.25 },
  name: { fontWeight: 700, fontSize: 27, letterSpacing: -0.8, lineHeight: 1.1 },
  title: { fontWeight: 500, fontSize: 12, color: ACCENT, marginTop: 4 },
  note: { marginTop: 10, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: SIDE_BG, borderRadius: 4, color: ACCENT, fontSize: 8.2, alignSelf: "flex-start" },
  h2: { fontWeight: 700, fontSize: 12, marginTop: 20, marginBottom: 10, letterSpacing: -0.2 },
  exp: { flexDirection: "row" },
  rail: { width: 14, alignItems: "center" },
  railDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT, marginTop: 3.5 },
  railLine: { width: 1, flex: 1, backgroundColor: "#d8d6f3", marginTop: 3 },
  expBody: { flex: 1, paddingLeft: 8, paddingBottom: 12 },
  expHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  company: { fontWeight: 700, fontSize: 10.5 },
  period: { fontSize: 8, color: MUTED },
  role: { color: MUTED, marginBottom: 6 },
  eng: { marginBottom: 8, paddingLeft: 9, borderLeftWidth: 2, borderLeftColor: "#e6e4f8" },
  client: { fontWeight: 600 },
  bullet: { flexDirection: "row", marginTop: 1.5 },
  bulletDot: { width: 8, color: ACCENT },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
  chip: { fontSize: 7.3, paddingVertical: 1.5, paddingHorizontal: 5, borderRadius: 3, backgroundColor: "#f1f0fb", color: "#3d3a8f" },
  chipOn: { backgroundColor: ACCENT, color: "#fff" },
  footer: { position: "absolute", bottom: 22, left: SIDE_W + 30, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.2, color: MUTED },
});

function Dots({ level, on }: { level: number; on: boolean }) {
  return (
    <View style={s.dots}>
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={[s.dot, { backgroundColor: n <= level ? (on ? "#0fae8e" : ACCENT) : "#d3d1ec" }]} />
      ))}
    </View>
  );
}

export function ModernTemplate({ cv, selected, generatedAt, lang, t }: TemplateProps) {
  const p = cv.profile;
  const sel = new Set(selected.map((x) => x.id));
  const selNames = selected.map((x) => x.name.toLowerCase());
  const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`;

  return (
    <Document {...docMeta(cv, lang)}>
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />

        <View style={s.side}>
          <View style={s.mono}>
            <Text style={s.monoText}>{initials}</Text>
          </View>

          <Text style={s.sideH}>{t.pdf.contacts}</Text>
          {contactItems(cv).map((c) =>
            c.href ? (
              <Link key={c.label} src={c.href} style={[s.sideItem, s.sideLink]}>
                {c.label}
              </Link>
            ) : (
              <Text key={c.label} style={s.sideItem}>
                {c.label}
              </Text>
            ),
          )}

          <Text style={s.sideH}>{t.pdf.skills}</Text>
          {skillGroups(cv).map((g) => (
            <View key={g.id} wrap={false}>
              <Text style={s.skillCat}>{t.skillCategories[g.id]}</Text>
              {g.skills.map((k) => (
                <View key={k.id} style={s.skill}>
                  <Text style={sel.has(k.id) ? { fontWeight: 600 } : undefined}>{k.name}</Text>
                  <Dots level={k.level} on={sel.has(k.id)} />
                </View>
              ))}
            </View>
          ))}

          {cv.languages.length ? (
            <>
              <Text style={s.sideH}>{t.pdf.languages}</Text>
              {cv.languages.map((l) => (
                <View key={l.id} style={s.skill}>
                  <Text>{l.name}</Text>
                  <Text style={{ color: MUTED }}>{l.level}</Text>
                </View>
              ))}
            </>
          ) : null}

          <Text style={s.sideH}>{t.pdf.education}</Text>
          {cv.education.map((e) => (
            <View key={e.id} style={{ marginBottom: 7 }} wrap={false}>
              <Text style={{ fontWeight: 600 }}>{e.title}</Text>
              <Text style={{ fontSize: 8.2 }}>{e.institution}</Text>
              <Text style={{ fontSize: 7.8, color: MUTED }}>{formatPeriod(e.start, e.end, lang)}</Text>
            </View>
          ))}
          {cv.certifications.map((c) => (
            <View key={c.id} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: 600 }}>{c.name}</Text>
              {c.issuer ? <Text style={{ fontSize: 8.2 }}>{c.issuer}</Text> : null}
            </View>
          ))}
        </View>

        <View style={s.main}>
          <Text style={s.name}>{fullName(cv)}</Text>
          <Text style={s.title}>{p.title}</Text>
          {selected.length ? <Text style={s.note}>{t.pdf.targeted}: {selected.map((x) => x.name).join(", ")}</Text> : null}

          {p.summary ? (
            <>
              <Text style={s.h2}>{t.pdf.profile}</Text>
              <Text>{p.summary}</Text>
            </>
          ) : null}

          <Text style={s.h2}>{t.pdf.experience}</Text>
          {cv.experiences.map((x, xi) => (
            <View key={x.id} style={s.exp}>
              <View style={s.rail}>
                <View style={[s.railDot, !x.end ? { backgroundColor: "#0fae8e" } : {}]} />
                {xi < cv.experiences.length - 1 ? <View style={s.railLine} /> : null}
              </View>
              <View style={s.expBody}>
                <View style={s.expHead} minPresenceAhead={50}>
                  <Text style={s.company}>{x.company}</Text>
                  <Text style={s.period}>{formatPeriod(x.start, x.end, lang)}</Text>
                </View>
                <Text style={s.role}>
                  {x.role}
                  {x.location ? `, ${x.location}` : ""}
                </Text>
                {x.engagements.map((e) => (
                  <View key={e.id} style={s.eng} wrap={false}>
                    <View style={s.expHead}>
                      <Text>
                        <Text style={s.client}>{e.client}</Text>
                        {e.via ? <Text style={{ color: MUTED }}> {t.via(e.via)}</Text> : null}
                      </Text>
                      <Text style={s.period}>{formatPeriod(e.start, e.end, lang)}</Text>
                    </View>
                    {e.summary ? <Text style={{ marginTop: 1 }}>{e.summary}</Text> : null}
                    {e.highlights.map((h, i) => (
                      <View key={i} style={s.bullet}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={{ flex: 1 }}>
                          {h.title ? <Text style={{ fontWeight: 600 }}>{h.title}: </Text> : null}
                          {h.text}
                        </Text>
                      </View>
                    ))}
                    {e.tech.length ? (
                      <View style={s.chips}>
                        {e.tech.map((tech) => (
                          <Text key={tech} style={[s.chip, selNames.some((n) => tech.toLowerCase().startsWith(n)) ? s.chipOn : {}]}>
                            {tech}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>
            {fullName(cv)}, {generatedAt}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
