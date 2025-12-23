# Product Requirements Document
## Konversationaler Gästeassistent für Boardinghouses & Hotels

| | |
|---|---|
| **Version:** | 1.0 |
| **Datum:** | Dezember 2025 |
| **Status:** | Entwurf |

---

## 1. Executive Summary

Der **Gästeassistent** ist eine konversationale KI-Anwendung, die Boardinghouse- und Hotelgästen über einen QR-Code im Zimmer sofortigen Zugang zu wichtigen Informationen und Services bietet. Die Lösung reduziert Anfragen an der Rezeption, verbessert das Gästeerlebnis und ermöglicht eine 24/7-Verfügbarkeit ohne zusätzliches Personal.

---

## 2. Produktvision & Ziele

### 2.1 Vision

Ein digitaler Concierge, der Gästen das Gefühl gibt, immer einen hilfsbereiten Ansprechpartner zur Verfügung zu haben – unabhängig von Tageszeit oder Personalverfügbarkeit.

### 2.2 Hauptziele

1. **Gästezufriedenheit erhöhen:** Schnelle, konsistente Antworten auf häufige Fragen
2. **Rezeption entlasten:** Automatisierung von 70% der Standardanfragen
3. **Upselling ermöglichen:** Zusatzservices proaktiv anbieten
4. **24/7 Verfügbarkeit:** Service rund um die Uhr, auch nachts und am Wochenende
5. **Lokale Empfehlungen:** Gäste mit der Umgebung verbinden

---

## 3. Zielgruppe

### 3.1 Primäre Nutzer (Gäste)

- Geschäftsreisende mit Langzeitaufenthalten
- Touristen und Kurzzeiturlauber
- Montagearbeiter und Projektmitarbeiter
- Internationale Gäste (Mehrsprachigkeit wichtig)

### 3.2 Sekundäre Nutzer (Betreiber)

- Boardinghouse-Manager
- Hotelrezeption / Front Desk
- Housekeeping-Koordinatoren

---

## 4. Kernfunktionen

### 4.1 Haus-Informationen

| Funktion | Beschreibung |
|----------|--------------|
| WLAN-Zugang | Netzwerkname und Passwort anzeigen |
| Check-out Zeiten | Check-out Zeit, Late Check-out Optionen |
| Waschküche | Standort, Nutzung, Kosten der Waschmaschine/Trockner |
| Gemeinschaftsküche | Standort, verfügbare Geräte, Nutzungsregeln |
| Parkplatz | Parkmöglichkeiten, Kosten, Reservierung |
| Hausregeln | Ruhezeiten, Rauchen, Haustiere etc. |
| Notfallkontakte | Notrufnummern, Hausmeister, Rezeption |
| Müllentsorgung | Standort der Mülltonnen, Trennung |

### 4.2 Buchbare Services

| Service | Details |
|---------|---------|
| Extra Reinigung | Zusätzliche Zimmerreinigung buchen (kostenpflichtig oder inklusive) |
| Wäscheservice | Wäsche waschen & bügeln durch Personal |
| Handtücher/Bettwäsche | Zusätzliche Handtücher oder Bettwäsche anfordern |
| Late Check-out | Späteren Abreisezeitpunkt anfragen |
| Reparaturmeldung | Defekte melden (Heizung, Lampe, etc.) |
| Schlüssel-Problem | Schlüssel verloren, Karte funktioniert nicht |

### 4.3 Lokale Empfehlungen

| Kategorie | Beispiele |
|-----------|-----------|
| Frühstück | Bäckereien, Cafés in der Nähe |
| Lieferdienste | Lieferando, Wolt, lokale Pizzerien |
| Supermärkte | Nächster REWE, EDEKA, Aldi mit Öffnungszeiten |
| Restaurants | Empfehlungen nach Küche, Preis, Entfernung |
| Apotheken | Nächste Apotheke, Notdienst-Apotheken |
| ÖPNV | Buslinien, S-Bahn, Fahrzeiten |
| Sehenswürdigkeiten | Lokale Attraktionen, Museen, Parks |

---

## 5. Beispiel-Konversationen

### Beispiel 1: WLAN-Anfrage

> **Gast:** Wie lautet das WLAN-Passwort?
>
> **Bot:** Gerne! Unser WLAN heißt "Boardinghouse-Gast" und das Passwort ist "Willkommen2024". Benötigen Sie weitere Hilfe bei der Verbindung?

### Beispiel 2: Waschmaschine nutzen

> **Gast:** Wo kann ich meine Wäsche waschen?
>
> **Bot:** Unsere Waschküche befindet sich im Untergeschoss. Die Waschmaschine kostet 3€ pro Waschgang, der Trockner 2€. Sie benötigen Münzen oder können Token an der Rezeption kaufen. Waschmittel ist im Automaten erhältlich. Soll ich Ihnen den Weg zeigen?

### Beispiel 3: Frühstück finden

> **Gast:** Wo kann ich frühstücken?
>
> **Bot:** Wir bieten kein Frühstück im Haus an, aber in der Nähe gibt es tolle Optionen: Die "Bäckerei Müller" (5 Min. zu Fuß) öffnet ab 6:30 Uhr, und das "Café Sonnenschein" bietet ein leckeres Frühstücksbuffet. Alternativ ist ein REWE-Supermarkt nur 3 Minuten entfernt. Soll ich Ihnen die Adressen schicken?

### Beispiel 4: Extra Reinigung buchen

> **Gast:** Kann ich eine zusätzliche Zimmerreinigung bekommen?
>
> **Bot:** Natürlich! Eine Extra-Reinigung kostet 25€. Wann wäre Ihnen ein passender Zeitpunkt? Unsere Reinigungskräfte sind zwischen 9:00 und 17:00 Uhr verfügbar.

### Beispiel 5: Defekt melden

> **Gast:** Die Heizung funktioniert nicht richtig.
>
> **Bot:** Das tut mir leid! Ich habe Ihre Meldung für Zimmer 205 weitergeleitet. Unser Techniker wird sich innerhalb von 2 Stunden darum kümmern. Können Sie das Problem kurz beschreiben – heizt sie gar nicht oder nur schwach?

### Beispiel 6: Essenslieferung

> **Gast:** Ich möchte Pizza bestellen.
>
> **Bot:** In Ihrer Nähe empfehle ich "Pizzeria Milano" (0800-1234567) mit Lieferung in ca. 30 Min. Alternativ können Sie über Lieferando oder Wolt bestellen. Soll ich Ihnen die direkten Links senden?

---

## 6. Suggestion Chips (Schnellauswahl)

Der Chatbot zeigt kontextbasierte Vorschläge als anklickbare Buttons:

### 6.1 Startbildschirm

- 🔐 WLAN-Passwort
- 🧺 Waschmaschine
- 🍳 Küche benutzen
- 🧹 Reinigung bestellen
- 🍕 Essen bestellen
- 🚗 Parkplatz-Info
- 🥐 Frühstück in der Nähe
- 📞 Rezeption kontaktieren

### 6.2 Nach Service-Anfrage

- ✅ Anfrage absenden
- 📅 Anderen Termin wählen
- 💰 Preise anzeigen
- ❌ Abbrechen

### 6.3 Nach Problemlösung

- 👍 Problem gelöst
- 🔄 Weitere Hilfe nötig
- 📞 Mit Rezeption sprechen

---

## 7. Technische Anforderungen

### 7.1 Zugang

- QR-Code in jedem Zimmer (individuell pro Zimmer für Tracking)
- Progressive Web App (PWA) – keine App-Installation nötig
- Responsive Design für Smartphone, Tablet, Desktop

### 7.2 Sprachen

- Deutsch (primär)
- Englisch
- Weitere Sprachen nach Bedarf (Polnisch, Türkisch, Arabisch)

### 7.3 Backend-Integrationen

- Property Management System (PMS) für Buchungsdaten
- Ticketing-System für Service-Anfragen
- Google Maps / Here API für lokale Empfehlungen
- Optional: Lieferando/Wolt API für direkte Bestellungen

### 7.4 Datenschutz (DSGVO)

- Keine persistente Speicherung von Chat-Verläufen ohne Einwilligung
- Anonymisierte Analytics
- Datenschutzerklärung beim ersten Scan

---

## 8. Admin-Dashboard für Betreiber

1. **Content Management:** Haus-Informationen pflegen, Preise aktualisieren
2. **Service-Übersicht:** Eingehende Anfragen sehen und bearbeiten
3. **Analytics:** Häufigste Fragen, Nutzungsstatistiken, Conversion-Raten
4. **Benachrichtigungen:** Push/E-Mail bei dringenden Anfragen (Defekte, Beschwerden)
5. **Multi-Property:** Mehrere Standorte zentral verwalten

---

## 9. Erfolgskriterien (KPIs)

| Metrik | Zielwert |
|--------|----------|
| QR-Code Scan-Rate | > 40% der Gäste |
| Automatisierte Anfragen | > 70% ohne Eskalation |
| Zufriedenheitsbewertung | > 4.2/5 Sterne |
| Zusatzservice-Buchungen | + 15% gegenüber Baseline |
| Antwortzeit | < 3 Sekunden |

---

## 10. Roadmap

### Phase 1: MVP (8 Wochen)

- Basis-Chatbot mit Haus-Informationen
- QR-Code System
- Einfache Service-Anfragen (Reinigung, Handtücher)
- Deutsch & Englisch

### Phase 2: Erweiterung (4 Wochen)

- Lokale Empfehlungen mit Karten-Integration
- Admin-Dashboard
- Analytics & Reporting

### Phase 3: Optimierung (laufend)

- KI-Training basierend auf echten Konversationen
- Weitere Sprachen
- PMS-Integration
- Lieferdienst-APIs

---

## 11. Risiken & Mitigationen

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Geringe Akzeptanz | Hoch | QR-Code prominent platzieren, Mehrwert kommunizieren |
| Bot versteht nicht | Mittel | Fallback zu Rezeption, kontinuierliches Training |
| Veraltete Infos | Mittel | Einfaches Admin-Interface, Erinnerungen |
| Technische Ausfälle | Hoch | Redundanz, Monitoring, Fallback-Kontakt anzeigen |

---

## 12. Häufige Gästefragen (FAQ-Katalog)

### Allgemein
- Wie ist das WLAN-Passwort?
- Wann ist Check-out?
- Kann ich später auschecken?
- Wo ist die Rezeption?
- Wie erreiche ich jemanden nachts?

### Waschküche
- Wo ist die Waschmaschine?
- Was kostet die Waschmaschine?
- Wo bekomme ich Waschmittel?
- Wie funktioniert der Trockner?
- Bis wann kann ich waschen?

### Küche
- Gibt es eine Küche?
- Welche Geräte sind vorhanden?
- Wo kann ich einkaufen?
- Gibt es Geschirr/Besteck?

### Services
- Kann ich extra Handtücher bekommen?
- Wann wird mein Zimmer gereinigt?
- Etwas ist kaputt – was tun?
- Kann ich meine Buchung verlängern?

### Umgebung
- Wo ist der nächste Supermarkt?
- Wo kann ich frühstücken?
- Wie komme ich zum Bahnhof?
- Wo kann ich Essen bestellen?
- Gibt es eine Apotheke in der Nähe?

---

*— Ende des Dokuments —*