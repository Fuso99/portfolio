import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatPeriod, fullName, techMatchesSkill } from "@/lib/utils";
import type { Engagement } from "@/lib/schema";
import { contactItems, docMeta, skillGroups, type Labels, type TemplateProps } from "../shared";

/**
 * Trace: the website's identity on paper. Light header with the current role
 * and an ion/signal rule, mono dates, chip-style stacks.
 */
const INK = "#171a2c";
const MUTED = "#61657d";
const ION = "#5b56e8";
const SIGNAL = "#0fae8e";
const PAD = 44;

const s = StyleSheet.create({
  page: { paddingTop: PAD, paddingBottom: 46, paddingHorizontal: PAD, fontFamily: "Geist", fontSize: 8.8, color: INK, lineHeight: 1.5 },
  header: {},
  headLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 16 },
  name: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 27, color: INK, letterSpacing: -0.8, lineHeight: 1.15 },
  now: { fontFamily: "Geist Mono", fontSize: 7.4, color: SIGNAL, marginBottom: 5 },
  title: { marginTop: 3, fontSize: 11, color: ION, fontWeight: 500 },
  contacts: { marginTop: 9, flexDirection: "row", flexWrap: "wrap" },
  contact: { fontFamily: "Geist Mono", fontSize: 7.6, color: MUTED, marginRight: 14, textDecoration: "none" },
  rule: { marginTop: 14, height: 2, flexDirection: "row", borderRadius: 1 },
  note: { marginTop: 14, fontSize: 8.2, color: ION },
  h2: { fontFamily: "Bricolage", fontWeight: 600, fontSize: 13, marginTop: 16, marginBottom: 8, letterSpacing: -0.3 },
  row: { flexDirection: "row" },
  date: { width: 96, fontFamily: "Geist Mono", fontSize: 7.2, color: MUTED, paddingTop: 2 },
  body: { flex: 1 },
  company: { fontFamily: "Bricolage", fontWeight: 600, fontSize: 11 },
  role: { color: MUTED, marginBottom: 6 },
  eng: { marginBottom: 7 },
  client: { fontWeight: 600 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
  chip: { fontSize: 7.1, paddingVertical: 1.2, paddingHorizontal: 4.5, borderRadius: 3, borderWidth: 0.6, borderColor: "#cfd1e2", color: "#3c4060" },
  chipOn: { borderColor: SIGNAL, color: SIGNAL, fontWeight: 600 },
  skills: { flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 8 },
  skillCol: { width: "30%" },
  skillCat: { fontWeight: 600, marginBottom: 4 },
  skill: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 1, fontSize: 8.2 },
  bar: { width: 34, height: 3, borderRadius: 1.5, backgroundColor: "#e3e4ef" },
  footer: { position: "absolute", bottom: 22, left: PAD, right: PAD, flexDirection: "row", justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: 6.8, color: MUTED },
});

function EngagementBlock({ e, isOn, lang, t }: { e: Engagement; isOn: (tech: string) => boolean } & Labels) {
  return (
    <View style={[s.row, s.eng]}>
      <Text style={s.date}>{formatPeriod(e.start, e.end, lang)}</Text>
      <View style={s.body}>
        <Text>
          <Text style={s.client}>{e.client}</Text>
          {e.via ? <Text style={{ color: MUTED }}> {t.via(e.via)}</Text> : null}
        </Text>
        {e.summary ? <Text>{e.summary}</Text> : null}
        {e.tech.length ? (
          <View style={s.chips}>
            {e.tech.map((tech) => (
              <Text key={tech} style={[s.chip, isOn(tech) ? s.chipOn : {}]}>
                {tech}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function TraceTemplate({ cv, selected, generatedAt, lang, t }: TemplateProps) {
  const p = cv.profile;
  const sel = new Set(selected.map((x) => x.id));
  const isOn = (tech: string) => selected.some((k) => techMatchesSkill(tech, k));

  return (
    <Document {...docMeta(cv, lang)}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headLine}>
            <Text style={s.name}>{fullName(cv)}</Text>
            {!cv.experiences[0]?.end && cv.experiences[0] ? (
              <Text style={s.now}>{`${cv.experiences[0].role}, ${cv.experiences[0].company.split(" - ")[0]}`}</Text>
            ) : null}
          </View>
          <Text style={s.title}>{p.title}</Text>
          <View style={s.contacts}>
            {contactItems(cv).map((c) =>
              c.href ? (
                <Link key={c.label} src={c.href} style={s.contact}>
                  {c.label}
                </Link>
              ) : (
                <Text key={c.label} style={s.contact}>
                  {c.label}
                </Text>
              ),
            )}
          </View>
          <View style={s.rule}>
            <View style={{ flex: 3, backgroundColor: ION }} />
            <View style={{ flex: 1, backgroundColor: SIGNAL }} />
          </View>
        </View>

        {selected.length ? <Text style={s.note}>{t.pdf.targeted}: {selected.map((x) => x.name).join(", ")}</Text> : null}

        {p.summary ? (
          <>
            <Text style={s.h2}>{t.pdf.profile}</Text>
            <Text style={{ maxWidth: 440 }}>{p.summary}</Text>
          </>
        ) : null}

        <Text style={s.h2}>{t.pdf.experience}</Text>
        {cv.experiences.map((x) => (
          <View key={x.id} style={{ marginBottom: 6 }}>
            {/* The header travels with the first engagement so it never sits alone at a page bottom. */}
            <View wrap={false}>
              <View style={s.row}>
                <Text style={[s.date, !x.end ? { color: SIGNAL } : {}]}>{formatPeriod(x.start, x.end, lang)}</Text>
                <View style={s.body}>
                  <Text style={s.company}>{x.company}</Text>
                  <Text style={s.role}>
                    {x.role}
                    {x.location ? `, ${x.location}` : ""}
                  </Text>
                </View>
              </View>
              {x.engagements[0] ? <EngagementBlock e={x.engagements[0]} isOn={isOn} lang={lang} t={t} /> : null}
            </View>
            {x.engagements.slice(1).map((e) => (
              <View key={e.id} wrap={false}>
                <EngagementBlock e={e} isOn={isOn} lang={lang} t={t} />
              </View>
            ))}
          </View>
        ))}

        <View wrap={false}>
          <Text style={s.h2}>{t.pdf.skills}</Text>
          <View style={s.skills}>
            {skillGroups(cv).map((g) => (
              <View key={g.id} style={s.skillCol}>
                <Text style={s.skillCat}>{t.skillCategories[g.id]}</Text>
                {g.skills.map((k) => (
                  <View key={k.id} style={s.skill}>
                    <Text style={sel.has(k.id) ? { color: SIGNAL, fontWeight: 600 } : undefined}>{k.name}</Text>
                    <View style={s.bar}>
                      <View style={{ width: `${(k.level / 5) * 100}%`, height: 3, borderRadius: 1.5, backgroundColor: sel.has(k.id) ? SIGNAL : ION }} />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={[s.row, { gap: 24 }]}>
          <View style={s.body}>
            <Text style={s.h2}>{t.pdf.education}</Text>
            {cv.education.map((e) => (
              <View key={e.id} style={[s.row, { marginBottom: 5 }]}>
                <Text style={[s.date, { width: 70 }]}>{e.end ? e.end.slice(0, 4) : t.date.present}</Text>
                <Text style={s.body}>
                  <Text style={s.client}>{e.title}</Text>
                  {"\n"}
                  <Text style={{ color: MUTED }}>{e.institution}</Text>
                </Text>
              </View>
            ))}
          </View>
          <View style={{ width: 150 }}>
            <Text style={s.h2}>{t.pdf.languages}</Text>
            {cv.languages.map((l) => (
              <View key={l.id} style={s.skill}>
                <Text>{l.name}</Text>
                <Text style={{ fontFamily: "Geist Mono", fontSize: 7.6, color: MUTED }}>{l.level}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {fullName(cv)} / {generatedAt}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
