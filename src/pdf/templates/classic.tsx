import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatMonth, formatPeriod, fullName } from "@/lib/utils";
import type { Engagement } from "@/lib/schema";
import { contactItems, docMeta, skillGroups, type Labels, type TemplateProps } from "../shared";

/**
 * Classico: one full-width column, the serif/sans pairing of the original
 * Word CV. Every heading line carries its period flush right, so text never
 * sits beside a second column. Each Text uses a single font family to keep
 * line boxes predictable (mixed families in one line caused overlaps).
 */
const INK = "#1d2433";
const MUTED = "#5b6475";
const ACCENT = "#2c4a7c";
const RULE = "#cfd5e0";

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 54, paddingHorizontal: 54, fontFamily: "Open Sans", fontSize: 9.2, color: INK, lineHeight: 1.5 },
  name: { fontFamily: "Merriweather", fontWeight: 700, fontSize: 24, lineHeight: 1.3, color: INK },
  title: { fontFamily: "Merriweather", fontWeight: 300, fontSize: 12, lineHeight: 1.4, color: ACCENT, marginTop: 2 },
  contacts: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, fontSize: 8.6, color: MUTED },
  contact: { marginRight: 16 },
  link: { color: MUTED, textDecoration: "none" },
  headRule: { height: 1, backgroundColor: INK, marginTop: 14 },
  note: { marginTop: 8, fontSize: 8.4, color: ACCENT },
  section: { marginTop: 18 },
  h2Wrap: { borderBottomWidth: 0.75, borderBottomColor: RULE, paddingBottom: 3, marginBottom: 9 },
  h2: { fontFamily: "Merriweather", fontWeight: 700, fontSize: 11.5, lineHeight: 1.35, color: ACCENT },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
  period: { fontSize: 8.4, color: MUTED, lineHeight: 1.4 },
  exp: { marginBottom: 12 },
  company: { fontFamily: "Merriweather", fontWeight: 700, fontSize: 10.5, lineHeight: 1.35, flexShrink: 1 },
  role: { fontStyle: "italic", color: MUTED, marginBottom: 5 },
  eng: { marginLeft: 10, marginBottom: 8 },
  client: { fontWeight: 700, flexShrink: 1 },
  tech: { marginTop: 3, fontSize: 8.2, color: MUTED },
  skillRow: { flexDirection: "row", marginBottom: 3 },
  skillCat: { width: 112, fontWeight: 700 },
  flex: { flex: 1 },
  selected: { fontWeight: 700, color: ACCENT },
  footer: { position: "absolute", bottom: 26, left: 54, right: 54, flexDirection: "row", justifyContent: "space-between", fontSize: 7.4, color: MUTED },
});

function H2({ children }: { children: string }) {
  return (
    <View style={s.h2Wrap} minPresenceAhead={40}>
      <Text style={s.h2}>{children}</Text>
    </View>
  );
}

function EngagementBlock({ e, lang, t }: { e: Engagement } & Labels) {
  return (
    <View style={s.eng}>
      <View style={s.line}>
        <Text style={s.client}>{e.via ? `${e.client}, ${t.via(e.via)}` : e.client}</Text>
        <Text style={s.period}>{formatPeriod(e.start, e.end, lang)}</Text>
      </View>
      {e.summary ? <Text>{e.summary}</Text> : null}
      {e.tech.length ? <Text style={s.tech}>{t.pdf.tech}: {e.tech.join(", ")}</Text> : null}
    </View>
  );
}

export function ClassicTemplate({ cv, selected, generatedAt, lang, t }: TemplateProps) {
  const p = cv.profile;
  const sel = new Set(selected.map((x) => x.id));
  return (
    <Document {...docMeta(cv, lang)}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{fullName(cv)}</Text>
        <Text style={s.title}>{p.title}</Text>
        <View style={s.contacts}>
          {contactItems(cv).map((c) =>
            c.href ? (
              <Link key={c.label} src={c.href} style={[s.contact, s.link]}>
                {c.label}
              </Link>
            ) : (
              <Text key={c.label} style={s.contact}>
                {c.label}
              </Text>
            ),
          )}
        </View>
        <View style={s.headRule} />
        {selected.length ? <Text style={s.note}>{t.pdf.targeted}: {selected.map((x) => x.name).join(", ")}</Text> : null}

        {p.summary ? (
          <View style={s.section}>
            <H2>{t.pdf.profile}</H2>
            <Text>{p.summary}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <H2>{t.pdf.experience}</H2>
          {cv.experiences.map((x) => (
            <View key={x.id} style={s.exp}>
              {/* The header travels with the first engagement so it never sits alone at a page bottom. */}
              <View wrap={false}>
                <View style={s.line}>
                  <Text style={s.company}>{x.company}</Text>
                  <Text style={s.period}>{formatPeriod(x.start, x.end, lang)}</Text>
                </View>
                <Text style={s.role}>{[x.role, x.location].filter(Boolean).join(", ")}</Text>
                {x.engagements[0] ? <EngagementBlock e={x.engagements[0]} lang={lang} t={t} /> : null}
              </View>
              {x.engagements.slice(1).map((e) => (
                <View key={e.id} wrap={false}>
                  <EngagementBlock e={e} lang={lang} t={t} />
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <H2>{t.pdf.skills}</H2>
          {skillGroups(cv).map((g) => (
            <View key={g.id} style={s.skillRow}>
              <Text style={s.skillCat}>{t.skillCategories[g.id]}</Text>
              <Text style={s.flex}>
                {g.skills.map((k, i) => (
                  <Text key={k.id} style={sel.has(k.id) ? s.selected : undefined}>
                    {k.name}
                    {i < g.skills.length - 1 ? ", " : ""}
                  </Text>
                ))}
              </Text>
            </View>
          ))}
          {cv.softSkills.length ? (
            <View style={s.skillRow}>
              <Text style={s.skillCat}>{t.pdf.soft}</Text>
              <Text style={s.flex}>{cv.softSkills.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.section} wrap={false}>
          <H2>{t.pdf.education}</H2>
          {cv.education.map((e) => (
            <View key={e.id} style={{ marginBottom: 6 }}>
              <View style={s.line}>
                <Text style={s.client}>{e.title}</Text>
                <Text style={s.period}>{formatPeriod(e.start, e.end, lang)}</Text>
              </View>
              <Text>{[e.institution, e.location].filter(Boolean).join(", ")}</Text>
              {e.description ? <Text style={{ color: MUTED }}>{e.description}</Text> : null}
            </View>
          ))}
          {cv.certifications.map((c) => (
            <View key={c.id} style={[s.line, { marginBottom: 4 }]}>
              <Text style={s.client}>{c.issuer ? `${c.name}, ${c.issuer}` : c.name}</Text>
              {c.date ? <Text style={s.period}>{formatMonth(c.date, lang)}</Text> : null}
            </View>
          ))}
        </View>

        {cv.languages.length ? (
          <View style={s.section} wrap={false}>
            <H2>{t.pdf.languages}</H2>
            {cv.languages.map((l) => (
              <View key={l.id} style={s.skillRow}>
                <Text style={s.skillCat}>{l.name}</Text>
                <Text style={s.flex}>{l.level}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
