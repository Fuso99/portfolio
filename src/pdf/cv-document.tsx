import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SKILL_CATEGORIES, type Cv, type Skill } from "@/lib/schema";
import { formatPeriod, fullName } from "@/lib/utils";

const ACCENT = "#5B5FE0";
const INK = "#16182A";
const MUTED = "#5E6278";
const RULE = "#DCDDEA";

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 9.5, color: INK, lineHeight: 1.45 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 24, letterSpacing: -0.4 },
  title: { fontSize: 12, color: ACCENT, marginTop: 2 },
  contacts: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, color: MUTED, fontSize: 8.5 },
  contact: { marginRight: 14 },
  link: { color: MUTED, textDecoration: "none" },
  filterNote: { marginTop: 10, padding: 6, backgroundColor: "#EEEFFC", color: ACCENT, fontSize: 8.5, borderRadius: 3 },
  section: { marginTop: 18 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11, color: ACCENT, paddingBottom: 3, marginBottom: 8, borderBottomWidth: 0.75, borderBottomColor: RULE },
  summary: { color: INK },
  exp: { marginBottom: 10 },
  expHead: { flexDirection: "row", justifyContent: "space-between" },
  company: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  period: { color: MUTED, fontSize: 8.5 },
  role: { color: MUTED, marginBottom: 4 },
  eng: { marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: RULE, marginBottom: 6 },
  engHead: { flexDirection: "row", justifyContent: "space-between" },
  client: { fontFamily: "Helvetica-Bold" },
  bullet: { flexDirection: "row", marginTop: 1.5 },
  dot: { width: 8, color: ACCENT },
  tech: { color: MUTED, fontSize: 8, marginTop: 3 },
  skillRow: { flexDirection: "row", marginBottom: 3 },
  skillCat: { width: 110, fontFamily: "Helvetica-Bold" },
  skillList: { flex: 1, color: INK },
  selectedSkill: { fontFamily: "Helvetica-Bold", color: ACCENT },
  twoCol: { flexDirection: "row", gap: 24 },
  col: { flex: 1 },
  footer: { position: "absolute", bottom: 22, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: MUTED },
});

export function CvDocument({ cv, selected = [], generatedAt }: { cv: Cv; selected?: Skill[]; generatedAt: string }) {
  const p = cv.profile;
  const selectedIds = new Set(selected.map((x) => x.id));
  const contacts = [p.location, p.phone, p.email].filter(Boolean);

  return (
    <Document title={`CV ${fullName(cv)}`} author={fullName(cv)} subject={p.title} language="it">
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{fullName(cv)}</Text>
        <Text style={s.title}>{p.title}</Text>
        <View style={s.contacts}>
          {contacts.map((c) => (
            <Text key={c} style={s.contact}>
              {c}
            </Text>
          ))}
          {p.linkedin ? (
            <Link src={p.linkedin} style={[s.contact, s.link]}>
              {p.linkedin.replace(/^https?:\/\//, "")}
            </Link>
          ) : null}
          {p.github ? (
            <Link src={p.github} style={[s.contact, s.link]}>
              {p.github.replace(/^https?:\/\//, "")}
            </Link>
          ) : null}
        </View>

        {selected.length > 0 ? (
          <Text style={s.filterNote}>
            Versione filtrata per: {selected.map((x) => x.name).join(", ")}
          </Text>
        ) : null}

        {p.summary ? (
          <View style={s.section}>
            <Text style={s.h2}>Profilo</Text>
            <Text style={s.summary}>{p.summary}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.h2}>Esperienza</Text>
          {cv.experiences.map((x) => (
            <View key={x.id} style={s.exp} wrap>
              <View style={s.expHead} minPresenceAhead={40}>
                <Text style={s.company}>
                  {x.company}
                  {x.location ? `, ${x.location}` : ""}
                </Text>
                <Text style={s.period}>{formatPeriod(x.start, x.end)}</Text>
              </View>
              <Text style={s.role}>{x.role}</Text>
              {x.engagements.map((e) => (
                <View key={e.id} style={s.eng} wrap={false}>
                  <View style={s.engHead}>
                    <Text style={s.client}>
                      {e.client}
                      {e.via ? ` (tramite ${e.via})` : ""}
                    </Text>
                    <Text style={s.period}>{formatPeriod(e.start, e.end)}</Text>
                  </View>
                  {e.summary ? <Text>{e.summary}</Text> : null}
                  {e.highlights.map((h, i) => (
                    <View key={i} style={s.bullet}>
                      <Text style={s.dot}>•</Text>
                      <Text style={{ flex: 1 }}>
                        {h.title ? <Text style={{ fontFamily: "Helvetica-Bold" }}>{h.title}: </Text> : null}
                        {h.text}
                      </Text>
                    </View>
                  ))}
                  {e.tech.length ? <Text style={s.tech}>{e.tech.join(", ")}</Text> : null}
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>Competenze</Text>
          {SKILL_CATEGORIES.map((c) => {
            const list = cv.skills.filter((k) => k.category === c.id);
            if (!list.length) return null;
            return (
              <View key={c.id} style={s.skillRow}>
                <Text style={s.skillCat}>{c.label}</Text>
                <Text style={s.skillList}>
                  {list.map((k, i) => (
                    <Text key={k.id} style={selectedIds.has(k.id) ? s.selectedSkill : undefined}>
                      {k.name}
                      {i < list.length - 1 ? ", " : ""}
                    </Text>
                  ))}
                </Text>
              </View>
            );
          })}
          {cv.softSkills.length ? (
            <View style={s.skillRow}>
              <Text style={s.skillCat}>Soft skill</Text>
              <Text style={s.skillList}>{cv.softSkills.join(", ")}</Text>
            </View>
          ) : null}
        </View>

        <View style={[s.section, s.twoCol]} wrap={false}>
          <View style={s.col}>
            <Text style={s.h2}>Formazione</Text>
            {cv.education.map((e) => (
              <View key={e.id} style={{ marginBottom: 6 }}>
                <Text style={s.client}>{e.title}</Text>
                <Text>
                  {e.institution}
                  {e.location ? `, ${e.location}` : ""}
                </Text>
                <Text style={s.period}>{formatPeriod(e.start, e.end)}</Text>
                {e.description ? <Text style={s.tech}>{e.description}</Text> : null}
              </View>
            ))}
            {cv.certifications.length ? (
              <>
                <Text style={[s.h2, { marginTop: 8 }]}>Certificazioni</Text>
                {cv.certifications.map((c) => (
                  <Text key={c.id}>
                    {c.name}
                    {c.issuer ? `, ${c.issuer}` : ""}
                  </Text>
                ))}
              </>
            ) : null}
          </View>
          <View style={s.col}>
            <Text style={s.h2}>Lingue</Text>
            {cv.languages.map((l) => (
              <Text key={l.id}>
                <Text style={s.client}>{l.name}</Text>
                {l.level ? `: ${l.level}` : ""}
              </Text>
            ))}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {fullName(cv)}, CV generato il {generatedAt}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
