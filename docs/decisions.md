# Technische Entscheidungen

## 23. November 2026 · F-001

- **Gestaltung.** Ruhige, warme Produktverwaltung mit getöntem Off-White, dunklem Grün, Manrope für Bedienelemente und Fraunces für Überschriften. Abgestufte Typografie und eine übersichtliche Tabelle stellen Produktdaten und Kennzeichnungen in den Vordergrund. Die Schriftdateien kommen mit der App.
- **Daten.** Die lokale SQLite-Datenbank wird über Prisma 7 und versionierte Migrationen verwaltet. Produkt- und Inhaltsstoffnummern werden automatisch vergeben. Preise werden in Cent, Herstellungsdauer in Minuten und Kategorien als Text gespeichert. Inhaltsstoffe sind als eigene Datensätze wiederverwendbar. Der Allergenhinweis ergibt sich aus ihren Kennzeichnungen.
- **Speicherung.** Der Server validiert die Eingaben und speichert Produkt, neue Inhaltsstoffe und Zuordnungen gemeinsam. BR 4 wird hier durch die Allergenkennzeichnung vorbereitet. Bestellsperre und Kundenbestätigung gehören zu F-003.
- **Anmeldung.** Auf dem Mac richtet Nina ihr Passwort verdeckt über `npm run setup:password` ein. Die App verwendet einen gesalzenen scrypt-Hash und ein separat erzeugtes Geheimnis aus der ignorierten `.env.local`. Das signierte Sitzungscookie ist acht Stunden gültig und für JavaScript gesperrt. Produktseiten und das Speichern prüfen die Sitzung auf dem Server. Die lokale Entwicklungs-App lauscht auf localhost.
- **Build.** Next.js verwendet für Entwicklung und Build Webpack. Turbopack konnte in der lokalen Prüfungsumgebung seinen Port für die CSS-Verarbeitung nicht öffnen.
