import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import miohostChars from "./miohost_chars.png";

const LS_KEYS = {
  lang: "pxai_guest_lang",
  scanned: "pxai_guest_qr_scanned",
};

const LANGS = {
  EN: "EN",
  DE: "DE",
};

const INTENTS = [
  {
    id: "wifi",
    label: { EN: "Wi-Fi", DE: "WLAN" },
    keywords: ["wifi", "wi-fi", "wlan", "password", "passwort", "internet", "connect", "connection", "verbinden", "verbindung"],
    reply: {
      EN: "Happy to help. Wi-Fi: “Boardinghouse-Gast” · Password: “Willkommen2024”. Want step-by-step connection tips?",
      DE: "Gerne. WLAN: „Boardinghouse-Gast“ · Passwort: „Willkommen2024“. Soll ich beim Verbinden helfen?",
    },
  },
  {
    id: "laundry",
    label: { EN: "Laundry", DE: "Waschküche" },
    keywords: [
      "laundry",
      "wash",
      "dryer",
      "washer",
      "washing",
      "wasch",
      "wäsche",
      "wasche",
      "waschen",
      "trockner",
      "waschmaschine",
      "waschraum",
    ],
    reply: {
      EN: "The laundry room is in the basement. Washer 3€, dryer 2€. Tokens at reception. Need directions?",
      DE: "Die Waschküche ist im Untergeschoss. Waschmaschine 3€, Trockner 2€. Token an der Rezeption. Soll ich den Weg schicken?",
    },
  },
  {
    id: "kitchen",
    label: { EN: "Kitchen", DE: "Küche" },
    keywords: ["kitchen", "cook", "microwave", "fridge", "küche", "kueche", "kochen", "mikrowelle", "kühlschrank"],
    reply: {
      EN: "Yes. The shared kitchen is on floor 2 with microwave, stove, and fridge. Please label your items.",
      DE: "Ja. Die Gemeinschaftsküche ist im 2. Stock mit Mikrowelle, Herd und Kühlschrank. Bitte alles beschriften.",
    },
  },
  {
    id: "parking",
    label: { EN: "Parking", DE: "Parken" },
    keywords: ["parking", "park", "garage", "parkplatz", "parkplätze", "parkplaetze", "parken"],
    reply: {
      EN: "Underground garage is 12€/night. Limited spots — should I reserve one for you?",
      DE: "Tiefgarage 12€/Nacht. Begrenzte Plätze — soll ich reservieren?",
    },
  },
  {
    id: "breakfast",
    label: { EN: "Breakfast", DE: "Frühstück" },
    keywords: ["breakfast", "frühstück", "bakery", "cafe", "bäckerei"],
    reply: {
      EN: "Nearby: Bäckerei Müller (5 min, opens 6:30) and Café Sonnenschein (7 min). Want addresses?",
      DE: "In der Nähe: Bäckerei Müller (5 Min, ab 6:30) und Café Sonnenschein (7 Min). Soll ich die Adressen senden?",
    },
  },
  {
    id: "checkout",
    label: { EN: "Checkout", DE: "Check-out" },
    keywords: ["checkout", "check out", "check-out", "abreise", "auschecken", "rechnung", "invoice", "verlängern"],
    reply: {
      EN: "Standard checkout is 11:00. Late checkout is bookable if available. What time would you prefer?",
      DE: "Standard-Check-out ist 11:00. Late Check-out ist je nach Verfügbarkeit buchbar. Welche Uhrzeit passt dir?",
    },
  },
  {
    id: "local",
    label: { EN: "Local tips", DE: "Lokale Tipps" },
    keywords: ["restaurant", "restaurants", "nearby", "in der nähe", "nähe", "pharmacy", "apotheke", "supermarket", "bus", "train"],
    reply: {
      EN: "I can recommend food, supermarkets, pharmacies, and transport nearby. What are you in the mood for?",
      DE: "Ich kann Essen, Supermärkte, Apotheken und ÖPNV in der Nähe empfehlen. Woran denkst du?",
    },
  },
  {
    id: "delivery",
    label: { EN: "Food delivery", DE: "Essen bestellen" },
    keywords: ["delivery", "deliver", "order food", "food delivery", "lieferdienst", "lieferando", "wolt", "essen bestellen", "pizza"],
    reply: {
      EN: "Top picks: Pizzeria Milano (~30 min) or order via Lieferando/Wolt. Want links?",
      DE: "Top-Tipps: Pizzeria Milano (~30 Min) oder per Lieferando/Wolt bestellen. Soll ich Links senden?",
    },
  },
  {
    id: "supermarket",
    label: { EN: "Supermarket", DE: "Supermarkt" },
    keywords: ["supermarket", "supermarkt", "grocery", "groceries", "einkaufen"],
    reply: {
      EN: "Nearest supermarkets: Lidl (very close), REWE (3 min walk), and ALDI (8 min walk). Want directions?",
      DE: "Nächste Supermärkte: Lidl (sehr nah), REWE (3 Min zu Fuß) und ALDI (8 Min zu Fuß). Soll ich den Weg schicken?",
    },
  },
  {
    id: "reception",
    label: { EN: "Reception", DE: "Rezeption" },
    keywords: ["reception", "front desk", "kontakt", "rezeption", "help"],
    reply: {
      EN: "Reception is available 24/7: +49 30 123 456. Want me to call them?",
      DE: "Die Rezeption ist 24/7 erreichbar: +49 30 123 456. Soll ich anrufen?",
    },
  },
  {
    id: "service_cleaning",
    label: { EN: "Extra cleaning", DE: "Extra-Reinigung" },
    keywords: ["cleaning", "clean", "reinigung", "extra cleaning"],
    reply: {
      EN: "Absolutely — I can book an extra cleaning. Please choose a time.",
      DE: "Gerne — ich kann eine Extra-Reinigung buchen. Bitte wähle eine Zeit.",
    },
    service: { id: "cleaning", price: { EN: "25€", DE: "25€" } },
  },
  {
    id: "service_towels",
    label: { EN: "Fresh towels", DE: "Handtücher" },
    keywords: ["towels", "towel", "handtücher", "bettwäsche", "linen"],
    reply: {
      EN: "I can arrange fresh towels. Please choose a delivery time.",
      DE: "Ich kann frische Handtücher organisieren. Bitte wähle eine Uhrzeit für die Lieferung.",
    },
    service: { id: "towels", price: { EN: "12€", DE: "12€" } },
  },
  {
    id: "service_late",
    label: { EN: "Late checkout", DE: "Late Check-out" },
    keywords: ["late", "late checkout", "spät", "später", "verlängern"],
    reply: {
      EN: "Late checkout is possible if available. What time would you like?",
      DE: "Late Check-out ist möglich, wenn verfügbar. Welche Uhrzeit möchtest du?",
    },
    service: { id: "late", price: { EN: "25€", DE: "25€" } },
  },
  {
    id: "service_repair",
    label: { EN: "Repair request", DE: "Defekt melden" },
    keywords: ["broken", "repair", "defekt", "kaputt", "heizung", "lampe"],
    reply: {
      EN: "Sorry about that. I’ll notify maintenance. What’s the issue and room number?",
      DE: "Oh je. Ich informiere den Techniker. Was ist defekt und in welchem Zimmer?",
    },
    service: { id: "repair", price: { EN: "Free", DE: "Kostenlos" } },
  },
];

const SERVICE_LABELS = {
  cleaning: { EN: "Extra cleaning", DE: "Extra-Reinigung" },
  towels: { EN: "Fresh towels", DE: "Handtücher" },
  late: { EN: "Late checkout", DE: "Late Check-out" },
  repair: { EN: "Repair request", DE: "Defekt melden" },
};

const QUICK_CHIPS = [
  {
    id: "wifi",
    icon: "🔐",
    label: { EN: "Wi-Fi password", DE: "WLAN-Passwort" },
    prompt: { EN: "What’s the Wi-Fi password?", DE: "Wie lautet das WLAN-Passwort?" },
  },
  {
    id: "laundry",
    icon: "🧺",
    label: { EN: "Laundry room", DE: "Waschmaschine" },
    prompt: { EN: "Where can I do laundry?", DE: "Wo kann ich Wäsche waschen?" },
  },
  {
    id: "late",
    icon: "🕓",
    label: { EN: "Late checkout", DE: "Late Check-out" },
    prompt: { EN: "Can I get a late checkout?", DE: "Kann ich später auschecken?" },
  },
  {
    id: "breakfast",
    icon: "🥐",
    label: { EN: "Breakfast nearby", DE: "Frühstück" },
    prompt: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" },
  },
  {
    id: "parking",
    icon: "🚗",
    label: { EN: "Parking info", DE: "Parken" },
    prompt: { EN: "Do you have parking?", DE: "Gibt es Parkplätze?" },
  },
  {
    id: "repair",
    icon: "🛠️",
    label: { EN: "Report an issue", DE: "Defekt melden" },
    prompt: { EN: "The heating is not working.", DE: "Die Heizung funktioniert nicht." },
  },
];

const SECONDARY_CHIPS = [
  {
    id: "kitchen",
    icon: "🍳",
    label: { EN: "Kitchen rules", DE: "Küche" },
    prompt: { EN: "Can I use the kitchen?", DE: "Kann ich die Küche benutzen?" },
  },
  {
    id: "local",
    icon: "📍",
    label: { EN: "Local tips", DE: "Tipps in der Nähe" },
    prompt: { EN: "Any good restaurants nearby?", DE: "Gibt es gute Restaurants in der Nähe?" },
  },
  {
    id: "checkout",
    icon: "🧾",
    label: { EN: "Checkout time", DE: "Check-out" },
    prompt: { EN: "What time is checkout?", DE: "Wann ist Check-out?" },
  },
  {
    id: "reception",
    icon: "📞",
    label: { EN: "Contact reception", DE: "Rezeption" },
    prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." },
  },
];

const CONTEXT_CHIPS = {
  wifi: [
    { id: "wifi_help", icon: "📶", label: { EN: "Help connecting", DE: "Verbindungs-Hilfe" }, prompt: { EN: "I can’t connect to the Wi-Fi.", DE: "Ich kann mich nicht verbinden." } },
    { id: "checkout", icon: "🧾", label: { EN: "Checkout time", DE: "Check-out" }, prompt: { EN: "What time is checkout?", DE: "Wann ist Check-out?" } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  laundry: [
    { id: "laundry_cost", icon: "💶", label: { EN: "Costs", DE: "Kosten" }, prompt: { EN: "How much does laundry cost?", DE: "Was kostet die Wäsche?" } },
    { id: "laundry_tokens", icon: "🪙", label: { EN: "Tokens", DE: "Token" }, prompt: { EN: "Where do I get tokens?", DE: "Wo bekomme ich Token?" } },
    { id: "kitchen", icon: "🍳", label: { EN: "Kitchen rules", DE: "Küche" }, prompt: { EN: "Can I use the kitchen?", DE: "Kann ich die Küche benutzen?" } },
  ],
  kitchen: [
    { id: "kitchen_rules", icon: "🧼", label: { EN: "House rules", DE: "Hausregeln" }, prompt: { EN: "Any house rules?", DE: "Gibt es Hausregeln?" } },
    { id: "breakfast", icon: "🥐", label: { EN: "Breakfast nearby", DE: "Frühstück" }, prompt: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" } },
    { id: "local", icon: "📍", label: { EN: "Local tips", DE: "Tipps in der Nähe" }, prompt: { EN: "Any good restaurants nearby?", DE: "Gibt es gute Restaurants in der Nähe?" } },
  ],
  parking: [
    { id: "reserve_parking", icon: "✅", label: { EN: "Reserve a spot", DE: "Platz reservieren" }, prompt: { EN: "Please reserve a parking spot.", DE: "Bitte einen Parkplatz reservieren." } },
    { id: "checkout", icon: "🧾", label: { EN: "Checkout time", DE: "Check-out" }, prompt: { EN: "What time is checkout?", DE: "Wann ist Check-out?" } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  breakfast: [
    { id: "local", icon: "📍", label: { EN: "Local tips", DE: "Tipps in der Nähe" }, prompt: { EN: "Any good restaurants nearby?", DE: "Gibt es gute Restaurants in der Nähe?" } },
    { id: "delivery", icon: "🍕", label: { EN: "Order food", DE: "Essen bestellen" }, prompt: { EN: "I want to order food.", DE: "Ich möchte Essen bestellen." } },
    { id: "supermarket", icon: "🛒", label: { EN: "Supermarket", DE: "Supermarkt" }, prompt: { EN: "Where is the nearest supermarket?", DE: "Wo ist der nächste Supermarkt?" } },
  ],
  checkout: [
    { id: "late", icon: "🕓", label: { EN: "Late checkout", DE: "Late Check-out" }, prompt: { EN: "Can I get a late checkout?", DE: "Kann ich später auschecken?" } },
    { id: "invoice", icon: "🧾", label: { EN: "Invoice", DE: "Rechnung" }, prompt: { EN: "How do I get my invoice?", DE: "Wie bekomme ich meine Rechnung?" } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  local: [
    { id: "breakfast", icon: "🥐", label: { EN: "Breakfast", DE: "Frühstück" }, prompt: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" } },
    { id: "pharmacy", icon: "💊", label: { EN: "Pharmacy", DE: "Apotheke" }, prompt: { EN: "Where is the nearest pharmacy?", DE: "Wo ist die nächste Apotheke?" } },
    { id: "transport", icon: "🚉", label: { EN: "Public transport", DE: "ÖPNV" }, prompt: { EN: "How do I get to the station?", DE: "Wie komme ich zum Bahnhof?" } },
  ],
  reception: [
    { id: "urgent", icon: "⚡", label: { EN: "Urgent issue", DE: "Dringend" }, prompt: { EN: "I have an urgent issue.", DE: "Ich habe ein dringendes Problem." } },
    { id: "repair", icon: "🛠️", label: { EN: "Report an issue", DE: "Defekt melden" }, prompt: { EN: "The heating is not working.", DE: "Die Heizung funktioniert nicht." } },
    { id: "late", icon: "🕓", label: { EN: "Late checkout", DE: "Late Check-out" }, prompt: { EN: "Can I get a late checkout?", DE: "Kann ich später auschecken?" } },
  ],
  service_cleaning: [
    { id: "time", icon: "📅", label: { EN: "Choose time", DE: "Zeit wählen" }, prompt: { EN: "Tomorrow at 10:00 works for me.", DE: "Morgen um 10:00 passt mir." } },
    { id: "towels", icon: "🧺", label: { EN: "Fresh towels", DE: "Handtücher" }, prompt: { EN: "I also need fresh towels.", DE: "Ich brauche auch frische Handtücher." } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  service_towels: [
    { id: "time", icon: "📅", label: { EN: "Choose time", DE: "Zeit wählen" }, prompt: { EN: "Please deliver at 15:00.", DE: "Bitte um 15:00 liefern." } },
    { id: "cleaning", icon: "🧹", label: { EN: "Extra cleaning", DE: "Extra-Reinigung" }, prompt: { EN: "Can I book extra cleaning too?", DE: "Kann ich auch eine Extra-Reinigung buchen?" } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  service_late: [
    { id: "time", icon: "🕓", label: { EN: "Choose time", DE: "Zeit wählen" }, prompt: { EN: "Could I check out at 14:00?", DE: "Kann ich um 14:00 auschecken?" } },
    { id: "invoice", icon: "🧾", label: { EN: "Invoice", DE: "Rechnung" }, prompt: { EN: "I need my invoice.", DE: "Ich brauche meine Rechnung." } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
  service_repair: [
    { id: "describe", icon: "📝", label: { EN: "Describe issue", DE: "Problem beschreiben" }, prompt: { EN: "The heater is not working in room 205.", DE: "Die Heizung in Zimmer 205 funktioniert nicht." } },
    { id: "urgent", icon: "⚡", label: { EN: "Mark urgent", DE: "Dringend" }, prompt: { EN: "This is urgent.", DE: "Das ist dringend." } },
    { id: "reception", icon: "📞", label: { EN: "Contact reception", DE: "Rezeption" }, prompt: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." } },
  ],
};

const INTENT_PROMPTS = {
  wifi: { EN: "What’s the Wi-Fi password?", DE: "Wie lautet das WLAN-Passwort?" },
  laundry: { EN: "Where can I do laundry?", DE: "Wo kann ich Wäsche waschen?" },
  kitchen: { EN: "Can I use the kitchen?", DE: "Kann ich die Küche benutzen?" },
  parking: { EN: "Do you have parking?", DE: "Gibt es Parkplätze?" },
  breakfast: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" },
  checkout: { EN: "What time is checkout?", DE: "Wann ist Check-out?" },
  local: { EN: "Any good restaurants nearby?", DE: "Gibt es gute Restaurants in der Nähe?" },
  reception: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." },
  service_cleaning: { EN: "I’d like extra cleaning.", DE: "Ich möchte eine Extra-Reinigung." },
  service_towels: { EN: "I need fresh towels.", DE: "Ich brauche frische Handtücher." },
  service_late: { EN: "Can I get a late checkout?", DE: "Kann ich später auschecken?" },
  service_repair: { EN: "The heating is not working.", DE: "Die Heizung funktioniert nicht." },
  delivery: { EN: "I want to order food.", DE: "Ich möchte Essen bestellen." },
  supermarket: { EN: "Where is the nearest supermarket?", DE: "Wo ist der nächste Supermarkt?" },
};

const BOARDINGHOUSE = {
  id: "boardinghouse",
  label: { EN: "Boardinghouse", DE: "Boardinghouse" },
  address: { EN: "Christian-Schad-Str. 2, 63743 Aschaffenburg", DE: "Christian-Schad-Str. 2, 63743 Aschaffenburg" },
  lat: 49.9661478,
  lon: 9.1571691,
  tone: "home",
};

const PRIMACASA_MARKER = {
  id: "primacasa",
  label: { EN: "PrimaCasa", DE: "PrimaCasa" },
  address: BOARDINGHOUSE.address,
  lat: BOARDINGHOUSE.lat,
  lon: BOARDINGHOUSE.lon,
  tone: "home",
};

const LIDL_MARKER = {
  id: "lidl",
  label: { EN: "Lidl (nearest)", DE: "Lidl (nächster)" },
  address: { EN: "Spessartstraße 40, 63743 Aschaffenburg", DE: "Spessartstraße 40, 63743 Aschaffenburg" },
  lat: 49.9656305,
  lon: 9.1542176,
  tone: "accent",
};

const RESTAURANT_MARKERS = [
  {
    id: "asia_wok",
    label: { EN: "Asia Wok & Sushi Bar", DE: "Asia Wok & Sushi Bar" },
    address: { EN: "Weißenburger Str. 2, 63739 Aschaffenburg", DE: "Weißenburger Str. 2, 63739 Aschaffenburg" },
    cuisine: { EN: "Asian", DE: "Asiatisch" },
    phone: "+49 6021 459090",
    orderUrl: "https://www.lieferando.de",
    siteUrl: "",
    lat: 49.9766,
    lon: 9.1509,
    tone: "food",
  },
  {
    id: "limon_grillhaus",
    label: { EN: "Limon Grillhaus", DE: "Limon Grillhaus" },
    address: { EN: "Südbahnhofstraße 3, 63739 Aschaffenburg", DE: "Südbahnhofstraße 3, 63739 Aschaffenburg" },
    cuisine: { EN: "Turkish", DE: "Türkisch" },
    phone: "+49 6021 5858560",
    orderUrl: "https://www.lieferando.de",
    siteUrl: "http://www.limongrillhausaschaffenburg.de",
    lat: 49.9758,
    lon: 9.1489,
    tone: "food",
  },
  {
    id: "pizzeria_calabria",
    label: { EN: "Pizzeria Calabria", DE: "Pizzeria Calabria" },
    address: { EN: "Goldbacher Str. 25, 63739 Aschaffenburg", DE: "Goldbacher Str. 25, 63739 Aschaffenburg" },
    cuisine: { EN: "Italian", DE: "Italienisch" },
    phone: "+49 6021 451080",
    orderUrl: "https://www.lieferando.de",
    siteUrl: "",
    lat: 49.9792,
    lon: 9.1495,
    tone: "food",
  },
  {
    id: "fegerer",
    label: { EN: "Wirtshaus Zum Fegerer", DE: "Wirtshaus Zum Fegerer" },
    address: { EN: "Schloßgasse 14, 63739 Aschaffenburg", DE: "Schloßgasse 14, 63739 Aschaffenburg" },
    cuisine: { EN: "German", DE: "Deutsch" },
    phone: "+49 6021 15646",
    orderUrl: "https://www.lieferando.de",
    siteUrl: "https://www.fegerer.de",
    lat: 49.9783,
    lon: 9.1512,
    tone: "food",
  },
  {
    id: "ilektra",
    label: { EN: "Ilektra Restaurant", DE: "Ilektra Restaurant" },
    address: { EN: "Schweinheimer Str. 13, 63743 Aschaffenburg", DE: "Schweinheimer Str. 13, 63743 Aschaffenburg" },
    cuisine: { EN: "Greek", DE: "Griechisch" },
    phone: "+49 6021 4392555",
    orderUrl: "https://www.lieferando.de",
    siteUrl: "http://www.ilektra-aschaffenburg.de",
    lat: 49.98,
    lon: 9.153,
    tone: "food",
  },
];

const MAP_CENTER = [BOARDINGHOUSE.lat, BOARDINGHOUSE.lon];
const MAP_ZOOM = 14;

const SERVICE_PRICES = {
  cleaning: { EN: "25€", DE: "25€" },
  towels: { EN: "12€", DE: "12€" },
  late: { EN: "25€", DE: "25€" },
  repair: { EN: "Free", DE: "Kostenlos" },
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FLOWS = {
  wifi: [
    {
      id: "wifi_1",
      bot: {
        EN: "Let’s fix it quickly. Which device are you using?",
        DE: "Wir lösen das schnell. Welches Gerät nutzt du?",
      },
      options: [
        { label: { EN: "iPhone / iPad", DE: "iPhone / iPad" }, user: { EN: "I’m on iPhone.", DE: "Ich bin auf iPhone." }, next: 1 },
        { label: { EN: "Android", DE: "Android" }, user: { EN: "Android device.", DE: "Android-Gerät." }, next: 1 },
        { label: { EN: "Laptop", DE: "Laptop" }, user: { EN: "Laptop.", DE: "Laptop." }, next: 1 },
      ],
    },
    {
      id: "wifi_2",
      bot: {
        EN: "Open Wi‑Fi settings, select “Boardinghouse-Gast”, enter the password “Willkommen2024”.",
        DE: "Öffne die WLAN-Einstellungen, wähle „Boardinghouse-Gast“, gib das Passwort „Willkommen2024“ ein.",
      },
      options: [
        { label: { EN: "Connected", DE: "Verbunden" }, user: { EN: "I’m connected now.", DE: "Ich bin verbunden." }, next: 2 },
        { label: { EN: "Still failing", DE: "Geht nicht" }, user: { EN: "Still not working.", DE: "Geht immer noch nicht." }, next: 3 },
      ],
    },
    {
      id: "wifi_3",
      bot: {
        EN: "Great. Anything else you need right now?",
        DE: "Super. Brauchst du noch etwas?",
      },
      options: [
        { label: { EN: "Local tips", DE: "Tipps in der Nähe" }, user: { EN: "Local tips, please.", DE: "Tipps in der Nähe, bitte." }, action: { type: "jump", intentId: "local" } },
        { label: { EN: "Checkout time", DE: "Check-out" }, user: { EN: "What time is checkout?", DE: "Wann ist Check-out?" }, action: { type: "jump", intentId: "checkout" } },
        { label: { EN: "All good", DE: "Alles gut" }, user: { EN: "All good, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "wifi_4",
      bot: {
        EN: "Try “Forget Network” and reconnect. If it still fails, I can escalate it.",
        DE: "Bitte „Netzwerk vergessen“ und erneut verbinden. Falls es weiterhin nicht klappt, eskaliere ich es.",
      },
      options: [
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Report issue", DE: "Defekt melden" }, user: { EN: "I want to report an issue.", DE: "Ich möchte einen Defekt melden." }, action: { type: "jump", intentId: "service_repair" } },
        { label: { EN: "Try again", DE: "Nochmal versuchen" }, user: { EN: "I’ll try again.", DE: "Ich versuche es nochmal." }, next: 1 },
      ],
    },
  ],
  laundry: [
    {
      id: "laundry_1",
      bot: {
        EN: "The laundry room is in the basement. What do you need?",
        DE: "Die Waschküche ist im Untergeschoss. Was brauchst du?",
      },
      options: [
        { label: { EN: "Prices", DE: "Preise" }, user: { EN: "What are the prices?", DE: "Was kostet es?" }, next: 1 },
        { label: { EN: "Tokens", DE: "Token" }, user: { EN: "Where do I get tokens?", DE: "Wo bekomme ich Token?" }, next: 2 },
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "What are the opening hours?", DE: "Welche Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Detergent & supplies", DE: "Waschmittel & Zubehör" }, user: { EN: "Where do I get detergent?", DE: "Wo bekomme ich Waschmittel?" }, next: 5 },
      ],
    },
    {
      id: "laundry_2",
      bot: {
        EN: "Washer 3€ per cycle, dryer 2€.",
        DE: "Waschmaschine 3€ pro Waschgang, Trockner 2€.",
      },
      options: [
        { label: { EN: "Tokens", DE: "Token" }, user: { EN: "Where do I get tokens?", DE: "Wo bekomme ich Token?" }, next: 2 },
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Detergent & supplies", DE: "Waschmittel & Zubehör" }, user: { EN: "Where do I get detergent?", DE: "Wo bekomme ich Waschmittel?" }, next: 5 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules for the laundry room?", DE: "Gibt es Regeln?" }, next: 6 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks, that’s all.", DE: "Danke, das reicht." }, action: { type: "end" } },
      ],
    },
    {
      id: "laundry_3",
      bot: {
        EN: "Tokens are available at reception. Detergent is in the vending box.",
        DE: "Token gibt es an der Rezeption. Waschmittel ist im Automaten.",
      },
      options: [
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules?", DE: "Gibt es Regeln?" }, next: 6 },
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "laundry_4",
      bot: {
        EN: "Take the elevator to B1. First door on the right.",
        DE: "Fahr mit dem Aufzug ins B1. Erste Tür rechts.",
      },
      options: [
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules?", DE: "Gibt es Regeln?" }, next: 6 },
        { label: { EN: "Kitchen info", DE: "Küche" }, user: { EN: "Anything about the kitchen?", DE: "Gibt es Infos zur Küche?" }, action: { type: "jump", intentId: "kitchen" } },
        { label: { EN: "Checkout time", DE: "Check-out" }, user: { EN: "What time is checkout?", DE: "Wann ist Check-out?" }, action: { type: "jump", intentId: "checkout" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Got it, thanks.", DE: "Verstanden, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "laundry_5",
      bot: {
        EN: "Laundry room is open daily 06:00–23:00.",
        DE: "Die Waschküche ist täglich von 06:00–23:00 geöffnet.",
      },
      options: [
        { label: { EN: "Prices", DE: "Preise" }, user: { EN: "What are the prices?", DE: "Was kostet es?" }, next: 1 },
        { label: { EN: "Tokens", DE: "Token" }, user: { EN: "Where do I get tokens?", DE: "Wo bekomme ich Token?" }, next: 2 },
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules?", DE: "Gibt es Regeln?" }, next: 6 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "laundry_6",
      bot: {
        EN: "Detergent is available in the vending box. Please bring small change just in case.",
        DE: "Waschmittel gibt es im Automaten. Bitte Kleingeld mitbringen.",
      },
      options: [
        { label: { EN: "Prices", DE: "Preise" }, user: { EN: "What are the prices?", DE: "Was kostet es?" }, next: 1 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules?", DE: "Gibt es Regeln?" }, next: 6 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All good, thanks.", DE: "Alles klar, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "laundry_7",
      bot: {
        EN: "Please label your laundry basket and remove clothes promptly after cycles.",
        DE: "Bitte den Wäschekorb beschriften und die Wäsche nach dem Waschgang zeitnah abholen.",
      },
      options: [
        { label: { EN: "Prices", DE: "Preise" }, user: { EN: "What are the prices?", DE: "Was kostet es?" }, next: 1 },
        { label: { EN: "Tokens", DE: "Token" }, user: { EN: "Where do I get tokens?", DE: "Wo bekomme ich Token?" }, next: 2 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 4 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
  ],
  kitchen: [
    {
      id: "kitchen_1",
      bot: {
        EN: "The shared kitchen is on floor 2. What do you need?",
        DE: "Die Gemeinschaftsküche ist im 2. Stock. Was brauchst du?",
      },
      options: [
        { label: { EN: "Equipment", DE: "Geräte" }, user: { EN: "Which equipment is available?", DE: "Welche Geräte gibt es?" }, next: 1 },
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any kitchen rules?", DE: "Gibt es Regeln?" }, next: 2 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "What are the opening hours?", DE: "Welche Öffnungszeiten?" }, next: 3 },
      ],
    },
    {
      id: "kitchen_2",
      bot: {
        EN: "Microwave, stove, fridge, and dishwasher are available.",
        DE: "Mikrowelle, Herd, Kühlschrank und Spülmaschine sind vorhanden.",
      },
      options: [
        { label: { EN: "Rules", DE: "Regeln" }, user: { EN: "Any rules?", DE: "Gibt es Regeln?" }, next: 2 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All good, thanks.", DE: "Alles klar, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "kitchen_3",
      bot: {
        EN: "Please label your items and clean up after use.",
        DE: "Bitte alles beschriften und nach Nutzung reinigen.",
      },
      options: [
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "What are the opening hours?", DE: "Welche Öffnungszeiten?" }, next: 3 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Understood, thanks.", DE: "Verstanden, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "kitchen_4",
      bot: {
        EN: "Kitchen is open 06:00–23:00.",
        DE: "Die Küche ist von 06:00–23:00 geöffnet.",
      },
      options: [
        { label: { EN: "Breakfast nearby", DE: "Frühstück" }, user: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" }, action: { type: "jump", intentId: "breakfast" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Great, thanks.", DE: "Super, danke." }, action: { type: "end" } },
      ],
    },
  ],
  parking: [
    {
      id: "parking_1",
      bot: {
        EN: "Underground garage is 12€/night, limited spots.",
        DE: "Die Tiefgarage kostet 12€/Nacht, begrenzte Plätze.",
      },
      options: [
        { label: { EN: "Reserve a spot", DE: "Platz reservieren" }, user: { EN: "Please reserve a spot.", DE: "Bitte einen Platz reservieren." }, next: 1 },
        { label: { EN: "Access info", DE: "Zugang" }, user: { EN: "How do I access it?", DE: "Wie komme ich rein?" }, next: 2 },
        { label: { EN: "Payment", DE: "Zahlung" }, user: { EN: "How do I pay?", DE: "Wie bezahle ich?" }, next: 3 },
      ],
    },
    {
      id: "parking_2",
      bot: {
        EN: "I can reserve a spot. Please share name + plate number.",
        DE: "Ich kann reservieren. Bitte Name + Kennzeichen.",
      },
      options: [
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks, that’s all.", DE: "Danke, das reicht." }, action: { type: "end" } },
      ],
    },
    {
      id: "parking_3",
      bot: {
        EN: "Access is via Gate B. Use your keycard to open.",
        DE: "Zugang über Tor B. Mit der Zimmerkarte öffnen.",
      },
      options: [
        { label: { EN: "Reserve a spot", DE: "Platz reservieren" }, user: { EN: "Please reserve a spot.", DE: "Bitte reservieren." }, next: 1 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Got it, thanks.", DE: "Verstanden, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "parking_4",
      bot: {
        EN: "Payment at reception or added to your invoice.",
        DE: "Zahlung an der Rezeption oder auf Rechnung.",
      },
      options: [
        { label: { EN: "Invoice", DE: "Rechnung" }, user: { EN: "I need the invoice.", DE: "Ich brauche die Rechnung." }, action: { type: "jump", intentId: "checkout" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
  ],
  breakfast: [
    {
      id: "breakfast_1",
      bot: {
        EN: "Nearby: Bäckerei Müller (5 min) and Café Sonnenschein (7 min).",
        DE: "In der Nähe: Bäckerei Müller (5 Min) und Café Sonnenschein (7 Min).",
      },
      options: [
        { label: { EN: "Addresses", DE: "Adressen" }, user: { EN: "Please send the addresses.", DE: "Bitte die Adressen." }, next: 1 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "When do they open?", DE: "Wann öffnen sie?" }, next: 2 },
        { label: { EN: "More options", DE: "Mehr Optionen" }, user: { EN: "Any other options?", DE: "Gibt es mehr?" }, next: 3 },
      ],
    },
    {
      id: "breakfast_2",
      bot: {
        EN: "Müller: Main St 12 · Sonnenschein: Park Ave 4.",
        DE: "Müller: Hauptstraße 12 · Sonnenschein: Parkallee 4.",
      },
      options: [
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "breakfast_3",
      bot: {
        EN: "Müller opens 06:30, Sonnenschein opens 07:00.",
        DE: "Müller öffnet um 06:30, Sonnenschein um 07:00.",
      },
      options: [
        { label: { EN: "Addresses", DE: "Adressen" }, user: { EN: "Please send the addresses.", DE: "Bitte die Adressen." }, next: 1 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Great, thanks.", DE: "Super, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "breakfast_4",
      bot: {
        EN: "I can also share supermarkets or delivery options nearby.",
        DE: "Ich kann auch Supermärkte oder Lieferoptionen in der Nähe nennen.",
      },
      options: [
        { label: { EN: "Local tips", DE: "Tipps in der Nähe" }, user: { EN: "Show local tips.", DE: "Zeig mir Tipps." }, action: { type: "jump", intentId: "local" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All set, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
  ],
  checkout: [
    {
      id: "checkout_1",
      bot: {
        EN: "Standard checkout is 11:00.",
        DE: "Standard-Check-out ist 11:00.",
      },
      options: [
        { label: { EN: "Late checkout", DE: "Late Check-out" }, user: { EN: "Can I get a late checkout?", DE: "Kann ich später auschecken?" }, next: 1 },
        { label: { EN: "Invoice", DE: "Rechnung" }, user: { EN: "How do I get my invoice?", DE: "Wie bekomme ich meine Rechnung?" }, next: 2 },
        { label: { EN: "Key return", DE: "Schlüsselrückgabe" }, user: { EN: "Where do I return the key?", DE: "Wo gebe ich den Schlüssel ab?" }, next: 3 },
      ],
    },
    {
      id: "checkout_2",
      bot: {
        EN: "Late checkout is 25€ if available.",
        DE: "Late Check-out kostet 25€, je nach Verfügbarkeit.",
      },
      options: [
        { label: { EN: "Request late checkout", DE: "Late Check-out anfragen" }, user: { EN: "Please request late checkout.", DE: "Bitte Late Check-out anfragen." }, action: { type: "service", serviceId: "late" } },
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "No thanks.", DE: "Nein, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "checkout_3",
      bot: {
        EN: "Invoice is emailed after checkout, or printed at reception.",
        DE: "Die Rechnung kommt per E-Mail nach dem Check-out oder direkt an der Rezeption.",
      },
      options: [
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Understood, thanks.", DE: "Verstanden, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "checkout_4",
      bot: {
        EN: "Return the key to reception or use the drop box by the entrance.",
        DE: "Gib den Schlüssel an der Rezeption ab oder nutze die Schlüsselbox am Eingang.",
      },
      options: [
        { label: { EN: "Reception", DE: "Rezeption" }, user: { EN: "I need the reception.", DE: "Ich brauche die Rezeption." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All good, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
  ],
  local: [
    {
      id: "local_1",
      bot: {
        EN: "What kind of local tips do you need?",
        DE: "Welche lokalen Tipps brauchst du?",
      },
      map: {
        title: { EN: "Local map", DE: "Lokale Karte" },
        subtitle: { EN: "", DE: "" },
        markers: [PRIMACASA_MARKER, ...RESTAURANT_MARKERS],
        listMarkers: RESTAURANT_MARKERS,
      },
      options: [
        { label: { EN: "Food", DE: "Essen" }, user: { EN: "Food recommendations, please.", DE: "Restaurant-Tipps, bitte." }, next: 1 },
        { label: { EN: "Pharmacy", DE: "Apotheke" }, user: { EN: "Nearest pharmacy?", DE: "Nächste Apotheke?" }, next: 2 },
        { label: { EN: "Transport", DE: "ÖPNV" }, user: { EN: "Public transport info.", DE: "ÖPNV-Infos." }, next: 3 },
      ],
    },
    {
      id: "local_2",
      bot: {
        EN: "Top picks: Pizzeria Milano and Sushi Go. Want delivery links?",
        DE: "Top-Tipps: Pizzeria Milano und Sushi Go. Möchtest du Lieferlinks?",
      },
      options: [
        { label: { EN: "Delivery links", DE: "Lieferlinks" }, user: { EN: "Yes, please send links.", DE: "Ja, bitte Links senden." }, action: { type: "end" } },
        { label: { EN: "More tips", DE: "Mehr Tipps" }, user: { EN: "More tips, please.", DE: "Mehr Tipps, bitte." }, next: 0 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "That’s enough, thanks.", DE: "Das reicht, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "local_3",
      bot: {
        EN: "Nearest pharmacy: Apotheke am Park, open until 20:00.",
        DE: "Nächste Apotheke: Apotheke am Park, geöffnet bis 20:00.",
      },
      options: [
        { label: { EN: "Transport", DE: "ÖPNV" }, user: { EN: "How do I get there?", DE: "Wie komme ich hin?" }, next: 3 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "local_4",
      bot: {
        EN: "S-Bahn S1 is 6 min away. Bus 120 runs every 10 min.",
        DE: "Die S-Bahn S1 ist 6 Min entfernt. Bus 120 fährt alle 10 Min.",
      },
      options: [
        { label: { EN: "More tips", DE: "Mehr Tipps" }, user: { EN: "More tips, please.", DE: "Mehr Tipps, bitte." }, next: 0 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Perfect, thanks.", DE: "Perfekt, danke." }, action: { type: "end" } },
      ],
    },
  ],
  reception: [
    {
      id: "reception_1",
      bot: {
        EN: "Reception is available 24/7 at +49 30 123 456. How would you like to reach them?",
        DE: "Die Rezeption ist 24/7 erreichbar unter +49 30 123 456. Wie möchtest du sie erreichen?",
      },
      options: [
        { label: { EN: "Call reception", DE: "Rezeption anrufen" }, user: { EN: "Please call reception.", DE: "Bitte Rezeption anrufen." }, next: 1 },
        { label: { EN: "Send a message", DE: "Nachricht senden" }, user: { EN: "I want to send a message.", DE: "Ich möchte eine Nachricht senden." }, next: 2 },
        { label: { EN: "Report an issue", DE: "Defekt melden" }, user: { EN: "I need to report an issue.", DE: "Ich möchte einen Defekt melden." }, next: 3 },
        { label: { EN: "Invoice / billing", DE: "Rechnung" }, user: { EN: "I have a billing question.", DE: "Ich habe eine Rechnungsfrage." }, action: { type: "jump", intentId: "checkout" } },
      ],
    },
    {
      id: "reception_2",
      bot: {
        EN: "I can connect you now or ask them to call you back.",
        DE: "Ich kann dich jetzt verbinden oder um einen Rückruf bitten.",
      },
      options: [
        { label: { EN: "Connect me now", DE: "Jetzt verbinden" }, user: { EN: "Please connect me now.", DE: "Bitte jetzt verbinden." }, action: { type: "end" } },
        { label: { EN: "Request callback", DE: "Rückruf anfragen" }, user: { EN: "Please call me back.", DE: "Bitte um Rückruf." }, next: 4 },
        { label: { EN: "Send a message", DE: "Nachricht senden" }, user: { EN: "I’ll send a message.", DE: "Ich sende eine Nachricht." }, next: 2 },
      ],
    },
    {
      id: "reception_3",
      bot: {
        EN: "What is your message about?",
        DE: "Worum geht es in deiner Nachricht?",
      },
      options: [
        {
          label: { EN: "General question", DE: "Allgemeine Frage" },
          user: { EN: "I have a general question.", DE: "Ich habe eine allgemeine Frage." },
          action: { type: "message", topic: { EN: "General question", DE: "Allgemeine Frage" } },
        },
        {
          label: { EN: "Late checkout request", DE: "Late Check-out" },
          user: { EN: "I want late checkout.", DE: "Ich möchte Late Check-out." },
          action: { type: "message", topic: { EN: "Late checkout request", DE: "Late-Check-out-Anfrage" } },
        },
        {
          label: { EN: "Invoice / billing", DE: "Rechnung" },
          user: { EN: "I need an invoice.", DE: "Ich brauche die Rechnung." },
          action: { type: "message", topic: { EN: "Invoice / billing", DE: "Rechnung" } },
        },
        {
          label: { EN: "Maintenance issue", DE: "Technik / Defekt" },
          user: { EN: "I want to report a maintenance issue.", DE: "Ich möchte einen Defekt melden." },
          action: { type: "message", topic: { EN: "Maintenance issue", DE: "Technik / Defekt" } },
        },
        {
          label: { EN: "Other", DE: "Sonstiges" },
          user: { EN: "Something else.", DE: "Etwas anderes." },
          action: { type: "message", topic: { EN: "Other", DE: "Sonstiges" } },
        },
      ],
    },
    {
      id: "reception_4",
      bot: {
        EN: "Is the issue urgent?",
        DE: "Ist das dringend?",
      },
      options: [
        {
          label: { EN: "Yes, urgent", DE: "Ja, dringend" },
          user: { EN: "Yes, urgent.", DE: "Ja, dringend." },
          action: { type: "message", topic: { EN: "Urgent issue", DE: "Dringender Defekt" } },
        },
        {
          label: { EN: "Not urgent", DE: "Nicht dringend" },
          user: { EN: "Not urgent.", DE: "Nicht dringend." },
          next: 5,
        },
        {
          label: { EN: "Open repair ticket", DE: "Ticket öffnen" },
          user: { EN: "Open a repair ticket.", DE: "Bitte ein Ticket öffnen." },
          action: { type: "jump", intentId: "service_repair" },
        },
      ],
    },
    {
      id: "reception_5",
      bot: {
        EN: "When should they call you back?",
        DE: "Wann sollen sie dich zurückrufen?",
      },
      options: [
        {
          label: { EN: "Morning (09:00–12:00)", DE: "Vormittag (09:00–12:00)" },
          user: { EN: "Morning works.", DE: "Vormittag passt." },
          action: {
            type: "message",
            topic: { EN: "Callback request", DE: "Rückruf" },
            preset: { EN: "Please call me back in the morning.", DE: "Bitte ruft mich vormittags zurück." },
          },
        },
        {
          label: { EN: "Afternoon (12:00–17:00)", DE: "Nachmittag (12:00–17:00)" },
          user: { EN: "Afternoon works.", DE: "Nachmittag passt." },
          action: {
            type: "message",
            topic: { EN: "Callback request", DE: "Rückruf" },
            preset: { EN: "Please call me back in the afternoon.", DE: "Bitte ruft mich nachmittags zurück." },
          },
        },
        {
          label: { EN: "Evening (17:00–21:00)", DE: "Abend (17:00–21:00)" },
          user: { EN: "Evening works.", DE: "Abend passt." },
          action: {
            type: "message",
            topic: { EN: "Callback request", DE: "Rückruf" },
            preset: { EN: "Please call me back in the evening.", DE: "Bitte ruft mich abends zurück." },
          },
        },
      ],
    },
    {
      id: "reception_6",
      bot: {
        EN: "If it’s not urgent, I can open a repair ticket or forward a message to reception.",
        DE: "Wenn es nicht dringend ist, kann ich ein Ticket öffnen oder eine Nachricht an die Rezeption senden.",
      },
      options: [
        {
          label: { EN: "Open repair ticket", DE: "Ticket öffnen" },
          user: { EN: "Open a repair ticket.", DE: "Bitte ein Ticket öffnen." },
          action: { type: "jump", intentId: "service_repair" },
        },
        {
          label: { EN: "Send message", DE: "Nachricht senden" },
          user: { EN: "Send a message to reception.", DE: "Bitte Nachricht an die Rezeption." },
          action: { type: "message", topic: { EN: "Maintenance issue", DE: "Technik / Defekt" } },
        },
        {
          label: { EN: "Call reception", DE: "Rezeption anrufen" },
          user: { EN: "Call reception.", DE: "Rezeption anrufen." },
          next: 1,
        },
      ],
    },
  ],
  service_cleaning: [
    {
      id: "cleaning_1",
      bot: {
        EN: "Extra cleaning costs 25€. When should we schedule it?",
        DE: "Extra-Reinigung kostet 25€. Wann sollen wir sie einplanen?",
      },
      options: [
        { label: { EN: "Morning", DE: "Vormittag" }, user: { EN: "Morning works.", DE: "Vormittag passt." }, next: 1 },
        { label: { EN: "Afternoon", DE: "Nachmittag" }, user: { EN: "Afternoon works.", DE: "Nachmittag passt." }, next: 1 },
        { label: { EN: "Pick a time", DE: "Zeit wählen" }, user: { EN: "I want to pick a time.", DE: "Ich möchte eine Zeit wählen." }, next: 1 },
      ],
    },
    {
      id: "cleaning_2",
      bot: {
        EN: "Great. I can confirm availability within minutes.",
        DE: "Super. Ich bestätige die Verfügbarkeit in wenigen Minuten.",
      },
      options: [
        { label: { EN: "Continue", DE: "Weiter" }, user: { EN: "Continue.", DE: "Weiter." }, next: 2 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel the request.", DE: "Anfrage abbrechen." }, action: { type: "end" } },
      ],
    },
    {
      id: "cleaning_3",
      bot: {
        EN: "Any notes for the cleaning team?",
        DE: "Gibt es Hinweise für das Reinigungsteam?",
      },
      options: [
        { label: { EN: "No notes", DE: "Keine Hinweise" }, user: { EN: "No notes.", DE: "Keine Hinweise." }, next: 3 },
        { label: { EN: "Add notes", DE: "Hinweise hinzufügen" }, user: { EN: "I’ll add notes.", DE: "Ich füge Hinweise hinzu." }, next: 3 },
      ],
    },
    {
      id: "cleaning_4",
      bot: {
        EN: "Ready to submit the request?",
        DE: "Bereit, die Anfrage zu senden?",
      },
      options: [
        { label: { EN: "Submit now", DE: "Jetzt senden" }, user: { EN: "Submit the request.", DE: "Bitte senden." }, action: { type: "service", serviceId: "cleaning" } },
        { label: { EN: "Change time", DE: "Zeit ändern" }, user: { EN: "I want to change the time.", DE: "Ich möchte die Zeit ändern." }, next: 0 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel.", DE: "Abbrechen." }, action: { type: "end" } },
      ],
    },
  ],
  service_towels: [
    {
      id: "towels_1",
      bot: {
        EN: "Fresh towels are 12€. When should we deliver them?",
        DE: "Frische Handtücher kosten 12€. Wann sollen wir liefern?",
      },
      options: [
        { label: { EN: "Soon", DE: "Sofort" }, user: { EN: "As soon as possible.", DE: "So schnell wie möglich." }, next: 1 },
        { label: { EN: "Later today", DE: "Später heute" }, user: { EN: "Later today.", DE: "Später heute." }, next: 1 },
        { label: { EN: "Pick a time", DE: "Zeit wählen" }, user: { EN: "I want to pick a time.", DE: "Ich möchte eine Zeit wählen." }, next: 1 },
      ],
    },
    {
      id: "towels_2",
      bot: {
        EN: "We deliver within 2 hours after confirmation.",
        DE: "Wir liefern innerhalb von 2 Stunden nach Bestätigung.",
      },
      options: [
        { label: { EN: "Continue", DE: "Weiter" }, user: { EN: "Continue.", DE: "Weiter." }, next: 2 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel the request.", DE: "Anfrage abbrechen." }, action: { type: "end" } },
      ],
    },
    {
      id: "towels_3",
      bot: {
        EN: "Any notes for delivery?",
        DE: "Gibt es Hinweise zur Lieferung?",
      },
      options: [
        { label: { EN: "No notes", DE: "Keine Hinweise" }, user: { EN: "No notes.", DE: "Keine Hinweise." }, next: 3 },
        { label: { EN: "Add notes", DE: "Hinweise hinzufügen" }, user: { EN: "I’ll add notes.", DE: "Ich füge Hinweise hinzu." }, next: 3 },
      ],
    },
    {
      id: "towels_4",
      bot: {
        EN: "Ready to submit the request?",
        DE: "Bereit, die Anfrage zu senden?",
      },
      options: [
        { label: { EN: "Submit now", DE: "Jetzt senden" }, user: { EN: "Submit the request.", DE: "Bitte senden." }, action: { type: "service", serviceId: "towels" } },
        { label: { EN: "Change time", DE: "Zeit ändern" }, user: { EN: "I want to change the time.", DE: "Ich möchte die Zeit ändern." }, next: 0 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel.", DE: "Abbrechen." }, action: { type: "end" } },
      ],
    },
  ],
  service_late: [
    {
      id: "late_1",
      bot: {
        EN: "Late checkout is 25€. What time do you prefer?",
        DE: "Late Check-out kostet 25€. Welche Uhrzeit passt dir?",
      },
      options: [
        { label: { EN: "13:00", DE: "13:00" }, user: { EN: "13:00 works.", DE: "13:00 passt." }, next: 1 },
        { label: { EN: "14:00", DE: "14:00" }, user: { EN: "14:00 works.", DE: "14:00 passt." }, next: 1 },
        { label: { EN: "15:00", DE: "15:00" }, user: { EN: "15:00 works.", DE: "15:00 passt." }, next: 1 },
      ],
    },
    {
      id: "late_2",
      bot: {
        EN: "I’ll check availability with the front desk.",
        DE: "Ich prüfe die Verfügbarkeit mit der Rezeption.",
      },
      options: [
        { label: { EN: "Continue", DE: "Weiter" }, user: { EN: "Continue.", DE: "Weiter." }, next: 2 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel the request.", DE: "Anfrage abbrechen." }, action: { type: "end" } },
      ],
    },
    {
      id: "late_3",
      bot: {
        EN: "Do you need the invoice emailed after checkout?",
        DE: "Möchtest du die Rechnung per E-Mail nach dem Check-out?",
      },
      options: [
        { label: { EN: "Yes", DE: "Ja" }, user: { EN: "Yes, please email it.", DE: "Ja, bitte per E-Mail." }, next: 3 },
        { label: { EN: "No", DE: "Nein" }, user: { EN: "No, thanks.", DE: "Nein, danke." }, next: 3 },
      ],
    },
    {
      id: "late_4",
      bot: {
        EN: "Ready to submit the late checkout request?",
        DE: "Bereit, die Late-Check-out-Anfrage zu senden?",
      },
      options: [
        { label: { EN: "Submit now", DE: "Jetzt senden" }, user: { EN: "Submit the request.", DE: "Bitte senden." }, action: { type: "service", serviceId: "late" } },
        { label: { EN: "Change time", DE: "Zeit ändern" }, user: { EN: "I want to change the time.", DE: "Ich möchte die Zeit ändern." }, next: 0 },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel.", DE: "Abbrechen." }, action: { type: "end" } },
      ],
    },
  ],
  service_repair: [
    {
      id: "repair_1",
      bot: {
        EN: "I’m sorry about that. What’s the issue?",
        DE: "Das tut mir leid. Was ist das Problem?",
      },
      options: [
        { label: { EN: "Heating", DE: "Heizung" }, user: { EN: "The heating is not working.", DE: "Die Heizung funktioniert nicht." }, next: 1 },
        { label: { EN: "Lighting", DE: "Licht" }, user: { EN: "The lamp is broken.", DE: "Die Lampe ist kaputt." }, next: 1 },
        { label: { EN: "Other", DE: "Anderes" }, user: { EN: "Another issue.", DE: "Ein anderes Problem." }, next: 1 },
      ],
    },
    {
      id: "repair_2",
      bot: {
        EN: "Is this urgent?",
        DE: "Ist das dringend?",
      },
      options: [
        { label: { EN: "Yes, urgent", DE: "Ja, dringend" }, user: { EN: "Yes, urgent.", DE: "Ja, dringend." }, next: 2 },
        { label: { EN: "Not urgent", DE: "Nicht dringend" }, user: { EN: "Not urgent.", DE: "Nicht dringend." }, next: 2 },
      ],
    },
    {
      id: "repair_3",
      bot: {
        EN: "When can our technician access the room?",
        DE: "Wann kann der Techniker ins Zimmer?",
      },
      options: [
        { label: { EN: "Anytime today", DE: "Heute jederzeit" }, user: { EN: "Anytime today.", DE: "Heute jederzeit." }, next: 3 },
        { label: { EN: "After 17:00", DE: "Nach 17:00" }, user: { EN: "After 17:00.", DE: "Nach 17:00." }, next: 3 },
        { label: { EN: "Tomorrow", DE: "Morgen" }, user: { EN: "Tomorrow.", DE: "Morgen." }, next: 3 },
      ],
    },
    {
      id: "repair_4",
      bot: {
        EN: "Ready to submit the repair request?",
        DE: "Bereit, die Reparatur-Anfrage zu senden?",
      },
      options: [
        { label: { EN: "Submit now", DE: "Jetzt senden" }, user: { EN: "Submit the request.", DE: "Bitte senden." }, action: { type: "service", serviceId: "repair" } },
        { label: { EN: "Contact reception", DE: "Rezeption" }, user: { EN: "Please contact reception.", DE: "Bitte Rezeption kontaktieren." }, action: { type: "jump", intentId: "reception" } },
        { label: { EN: "Cancel", DE: "Abbrechen" }, user: { EN: "Cancel.", DE: "Abbrechen." }, action: { type: "end" } },
      ],
    },
  ],
  delivery: [
    {
      id: "delivery_1",
      bot: {
        EN: "You can order via Lieferando or Wolt, or call Pizzeria Milano.",
        DE: "Du kannst über Lieferando oder Wolt bestellen oder Pizzeria Milano anrufen.",
      },
      map: {
        title: { EN: "Nearby restaurants", DE: "Restaurants in der Nähe" },
        subtitle: { EN: "", DE: "" },
        markers: [PRIMACASA_MARKER, ...RESTAURANT_MARKERS],
        listMarkers: RESTAURANT_MARKERS,
      },
      options: [
        { label: { EN: "Send links", DE: "Links senden" }, user: { EN: "Please send links.", DE: "Bitte Links senden." }, next: 1 },
        { label: { EN: "Call pizzeria", DE: "Pizzeria anrufen" }, user: { EN: "Call the pizzeria.", DE: "Pizzeria anrufen." }, next: 2 },
        { label: { EN: "More tips", DE: "Mehr Tipps" }, user: { EN: "More tips, please.", DE: "Mehr Tipps, bitte." }, next: 3 },
      ],
    },
    {
      id: "delivery_2",
      bot: {
        EN: "Here are the links: Lieferando / Wolt. Want anything else?",
        DE: "Hier sind die Links: Lieferando / Wolt. Noch etwas?",
      },
      options: [
        { label: { EN: "Supermarket", DE: "Supermarkt" }, user: { EN: "Where is the nearest supermarket?", DE: "Wo ist der nächste Supermarkt?" }, action: { type: "jump", intentId: "supermarket" } },
        { label: { EN: "Local tips", DE: "Tipps in der Nähe" }, user: { EN: "Show local tips.", DE: "Zeig mir Tipps." }, action: { type: "jump", intentId: "local" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All set, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "delivery_3",
      bot: {
        EN: "Pizzeria Milano delivers in ~30 minutes.",
        DE: "Pizzeria Milano liefert in ~30 Minuten.",
      },
      options: [
        { label: { EN: "Send links", DE: "Links senden" }, user: { EN: "Please send links.", DE: "Bitte Links senden." }, next: 1 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "delivery_4",
      bot: {
        EN: "I can also suggest nearby restaurants or supermarkets.",
        DE: "Ich kann auch Restaurants oder Supermärkte in der Nähe empfehlen.",
      },
      options: [
        { label: { EN: "Restaurants", DE: "Restaurants" }, user: { EN: "Restaurant tips, please.", DE: "Restaurant-Tipps, bitte." }, action: { type: "jump", intentId: "local" } },
        { label: { EN: "Supermarket", DE: "Supermarkt" }, user: { EN: "Nearest supermarket?", DE: "Nächster Supermarkt?" }, action: { type: "jump", intentId: "supermarket" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All good, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
  ],
  supermarket: [
    {
      id: "supermarket_1",
      bot: {
        EN: "Nearest supermarkets: Lidl (very close), REWE (3 min walk, until 22:00) and ALDI (8 min walk).",
        DE: "Nächste Supermärkte: Lidl (sehr nah), REWE (3 Min zu Fuß, bis 22:00) und ALDI (8 Min zu Fuß).",
      },
      map: {
        title: { EN: "Supermarkets nearby", DE: "Supermärkte in der Nähe" },
        subtitle: { EN: "", DE: "" },
        markers: [PRIMACASA_MARKER, LIDL_MARKER],
        listMarkers: [LIDL_MARKER],
      },
      options: [
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "Please send directions.", DE: "Bitte Wegbeschreibung." }, next: 1 },
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 2 },
        { label: { EN: "Other options", DE: "Weitere Optionen" }, user: { EN: "Any other options?", DE: "Gibt es weitere Optionen?" }, next: 3 },
      ],
    },
    {
      id: "supermarket_2",
      bot: {
        EN: "REWE: 3 min walk via Main St. ALDI: 8 min via Park Ave.",
        DE: "REWE: 3 Min zu Fuß über die Hauptstraße. ALDI: 8 Min über die Parkallee.",
      },
      options: [
        { label: { EN: "Opening hours", DE: "Öffnungszeiten" }, user: { EN: "Opening hours?", DE: "Öffnungszeiten?" }, next: 2 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Thanks!", DE: "Danke!" }, action: { type: "end" } },
      ],
    },
    {
      id: "supermarket_3",
      bot: {
        EN: "REWE is open until 22:00, ALDI until 20:00.",
        DE: "REWE ist bis 22:00 offen, ALDI bis 20:00.",
      },
      options: [
        { label: { EN: "Directions", DE: "Wegbeschreibung" }, user: { EN: "Please send directions.", DE: "Bitte Wegbeschreibung." }, next: 1 },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "Perfect, thanks.", DE: "Perfekt, danke." }, action: { type: "end" } },
      ],
    },
    {
      id: "supermarket_4",
      bot: {
        EN: "I can also suggest delivery or breakfast spots nearby.",
        DE: "Ich kann auch Lieferdienste oder Frühstück in der Nähe empfehlen.",
      },
      options: [
        { label: { EN: "Delivery", DE: "Lieferdienst" }, user: { EN: "I want delivery options.", DE: "Ich möchte Lieferoptionen." }, action: { type: "jump", intentId: "delivery" } },
        { label: { EN: "Breakfast", DE: "Frühstück" }, user: { EN: "Where can I get breakfast?", DE: "Wo kann ich frühstücken?" }, action: { type: "jump", intentId: "breakfast" } },
        { label: { EN: "Done", DE: "Fertig" }, user: { EN: "All good, thanks.", DE: "Alles gut, danke." }, action: { type: "end" } },
      ],
    },
  ],
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getInitialLang() {
  const saved = typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.lang) : null;
  return saved === LANGS.DE || saved === LANGS.EN ? saved : LANGS.DE;
}

function getScannedFromUrlOrStorage() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const qr = params.get("qr");
  if (qr === "1" || qr === "true") return true;
  return localStorage.getItem(LS_KEYS.scanned) === "1";
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isSimpleKeyword(keyword) {
  return /^[a-z0-9]+$/i.test(keyword);
}

function matchIntent(text) {
  const t = (text || "").toLowerCase().trim();
  if (!t) return { intent: null, score: 0, confidence: "none", hits: [] };

  let best = { intent: null, score: 0, hits: [] };
  for (const intent of INTENTS) {
    let score = 0;
    const hits = [];
    for (const kw of intent.keywords) {
      const k = kw.toLowerCase();
      if (!isSimpleKeyword(k)) {
        if (t.includes(k)) {
          score += 3;
          hits.push(kw);
        }
      } else {
        const re = new RegExp(`\\b${escapeRegExp(k)}\\b`, "i");
        if (re.test(t)) {
          score += 2;
          hits.push(kw);
        }
      }
    }
    score += Math.min(2, Math.floor(t.length / 40));
    if (score > best.score) best = { intent, score, hits };
  }

  const confidence =
    best.score >= 8 ? "high" : best.score >= 5 ? "medium" : best.score >= 2 ? "low" : "none";

  return { intent: best.intent, score: best.score, confidence, hits: best.hits };
}

function rankIntents(text) {
  const t = (text || "").toLowerCase().trim();
  if (!t) return [];
  const scored = INTENTS.map((intent) => {
    let score = 0;
    for (const kw of intent.keywords) {
      const k = kw.toLowerCase();
      if (!isSimpleKeyword(k)) {
        if (t.includes(k)) score += 3;
      } else {
        const re = new RegExp(`\\b${escapeRegExp(k)}\\b`, "i");
        if (re.test(t)) score += 2;
      }
    }
    score += Math.min(2, Math.floor(t.length / 40));
    return { intent, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => {
      const confidence =
        item.score >= 8 ? "high" : item.score >= 5 ? "medium" : item.score >= 2 ? "low" : "none";
      return { ...item, confidence };
    });

  return scored;
}

function getFlowStartIndex(intentId, text) {
  const t = (text || "").toLowerCase();
  if (intentId === "laundry") {
    if (/(price|cost|kosten|preis|preise|was kostet)/i.test(t)) return 1;
    if (/(token|coin|münze|muenze|jeton)/i.test(t)) return 2;
    if (/(weg|richtung|directions|how do i get|wo ist|where is)/i.test(t)) return 3;
    if (/(öffnungszeit|oeffnungszeit|opening hours)/i.test(t)) return 4;
    if (/(waschmittel|detergent|soap|zubehör|zubehoer)/i.test(t)) return 5;
    if (/(regel|rules)/i.test(t)) return 6;
  }
  return 0;
}

function Button({ children, onClick, variant = "primary", className, disabled, type = "button" }) {
  const styles = {
    primary:
      "bg-gradient-to-b from-amber-100/90 to-amber-200/70 text-slate-900 hover:from-amber-100 hover:to-amber-200 disabled:opacity-60 disabled:cursor-not-allowed",
    ghost:
      "bg-white/0 text-white hover:bg-white/10 ring-1 ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed",
    subtle:
      "bg-white/5 text-white hover:bg-white/10 ring-1 ring-white/10 disabled:opacity-40 disabled:cursor-not-allowed",
    cta:
      "bg-gradient-to-b from-sky-100 to-sky-200 text-slate-900 ring-2 ring-sky-200/60 shadow-[0_12px_30px_-18px_rgba(56,189,248,0.7)] hover:from-sky-100 hover:to-sky-300 disabled:opacity-60 disabled:cursor-not-allowed",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded-full px-4 py-2 text-base font-semibold tracking-tight transition active:scale-[0.99]",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function Card({ children, className }) {
  return (
    <div
      className={cx(
        "rounded-[28px] bg-white/6 p-6 ring-1 ring-white/10 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function Header({ lang, setLang, scanned, setScanned, setStep }) {
  const t = useMemo(() => {
    return {
      title: { EN: "miohost", DE: "miohost" }[lang],
      subtitle: {
        EN: "A premium virtual receptionist for every stay",
        DE: "Eine Premium-Virtuelle-Rezeption für jeden Aufenthalt",
      }[lang],
      qr: { EN: "QR scanned", DE: "QR gescannt" }[lang],
      reset: { EN: "Reset demo", DE: "Demo zurücksetzen" }[lang],
      langBtn: lang === LANGS.EN ? "DE" : "EN",
    };
  }, [lang]);

  return (
    <div className="relative flex items-center justify-between gap-3 overflow-visible">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/20 grid place-items-center overflow-hidden">
          <img src={miohostChars} alt="miohost" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-white font-['Fraunces']">
          {t.title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-full bg-emerald-400/10 text-emerald-100 ring-1 ring-emerald-200/20 px-2.5 py-0.5 text-sm">
          {t.qr}: <b className="font-semibold">{scanned ? "ON" : "OFF"}</b>
        </div>

        <Button
          variant="subtle"
          className="px-3 py-1.5"
          onClick={() => {
            const next = lang === LANGS.EN ? LANGS.DE : LANGS.EN;
            setLang(next);
            localStorage.setItem(LS_KEYS.lang, next);
          }}
        >
          🌐 {t.langBtn}
        </Button>

        {!scanned ? (
          <Button
            className="px-3 py-1.5"
            onClick={() => {
              setScanned(true);
              setStep("chat");
              localStorage.setItem(LS_KEYS.scanned, "1");
            }}
          >
            📷 Simulate QR
          </Button>
        ) : (
          <Button
            variant="subtle"
            className="px-3 py-1.5"
            onClick={() => {
              setScanned(false);
              localStorage.setItem(LS_KEYS.scanned, "0");
            }}
          >
            Undo scan
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatBubble({ tone = "bot", children, roomNumber = "205" }) {
  if (tone === "bot") {
    return (
      <div className="flex items-end gap-2">
        <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden ring-1 ring-amber-200/30 bg-gradient-to-b from-amber-100 to-amber-200">
          <img src={miohostChars} alt="miohost" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 text-base leading-relaxed bg-gradient-to-b from-amber-50 to-amber-100 text-slate-800 shadow-sm">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 justify-end">
      <div
        className={cx(
          "max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-base leading-relaxed",
          "bg-white/10 text-white ring-1 ring-white/10"
        )}
      >
        {children}
      </div>
      <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-500/20 ring-1 ring-emerald-300/30 grid place-items-center">
        <span className="text-xs font-semibold text-emerald-100">{roomNumber}</span>
      </div>
    </div>
  );
}

function SystemBubble({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/5 text-emerald-100 ring-1 ring-white/10",
    high: "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-300/30",
    medium: "bg-amber-500/15 text-amber-100 ring-1 ring-amber-300/30",
    low: "bg-rose-500/15 text-rose-100 ring-1 ring-rose-300/30",
  };
  return (
    <div className={cx("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm", tones[tone])}>
      {children}
    </div>
  );
}

function TypingIndicator({ lang }) {
  return (
    <div className="flex items-center gap-2 text-sm text-emerald-100/80">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-emerald-200/70 animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-emerald-200/70 animate-bounce [animation-delay:120ms]" />
        <span className="h-2 w-2 rounded-full bg-emerald-200/70 animate-bounce [animation-delay:240ms]" />
      </span>
      <span>{lang === "EN" ? "Reading your request…" : "Ich schaue kurz…"}</span>
    </div>
  );
}

function SuggestionCard({ title, confidence, onClick }) {
  const tones = {
    high: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
    medium: "border-amber-300/40 bg-amber-400/10 text-amber-100",
    low: "border-rose-300/40 bg-rose-400/10 text-rose-100",
    none: "border-white/15 bg-white/5 text-white",
  };
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left text-base transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-22px_rgba(0,0,0,0.9)]",
        tones[confidence]
      )}
    >
      <div className="text-sm uppercase tracking-wide opacity-80">Intent</div>
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm opacity-80">Confidence: {confidence.toUpperCase()}</div>
    </button>
  );
}

function MapFocus({ center, activeMarker }) {
  const map = useMap();
  useEffect(() => {
    const target = activeMarker ? [activeMarker.lat, activeMarker.lon] : center;
    map.setView(target, MAP_ZOOM);
  }, [activeMarker, center, map]);
  return null;
}

const MARKER_TONES = {
  home: { ring: "rgba(16, 185, 129, 0.65)", fill: "rgba(16, 185, 129, 0.35)" },
  accent: { ring: "rgba(56, 189, 248, 0.65)", fill: "rgba(56, 189, 248, 0.35)" },
  food: { ring: "rgba(251, 191, 36, 0.7)", fill: "rgba(251, 191, 36, 0.4)" },
  default: { ring: "rgba(255, 255, 255, 0.6)", fill: "rgba(255, 255, 255, 0.25)" },
};

function MarkerItem({ marker, lang, isActive, onSelectMarker }) {
  const ref = useRef(null);
  useEffect(() => {
    if (isActive) ref.current?.openPopup();
  }, [isActive]);
  const tone = MARKER_TONES[marker.tone] || MARKER_TONES.default;
  const icon = useMemo(() => {
    const size = isActive ? 22 : 18;
    const dot = isActive ? 10 : 8;
    return L.divIcon({
      className: "",
      html: `
        <div class="mio-marker" style="
          width:${size}px;height:${size}px;border-radius:999px;
          border:2px solid ${tone.ring};background:${tone.fill};
          box-shadow:0 0 0 6px rgba(0,0,0,0.25), 0 8px 16px rgba(0,0,0,0.35);
          display:grid;place-items:center;
        ">
          ${isActive ? '<div class="mio-marker__pulse" style="border-color:' + tone.ring + ';"></div>' : ""}
          <div style="width:${dot}px;height:${dot}px;border-radius:999px;background:${tone.ring};"></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  }, [isActive, tone.fill, tone.ring]);
  return (
    <Marker
      position={[marker.lat, marker.lon]}
      ref={ref}
      icon={icon}
      eventHandlers={{
        click: () => onSelectMarker?.(marker.id),
      }}
    >
      <Popup>
        <div className="text-base font-semibold">{marker.label[lang]}</div>
        <div className="text-sm">{marker.address[lang]}</div>
      </Popup>
    </Marker>
  );
}

function MapWidgetCard({ lang, title, subtitle, markers, listMarkers, activeMarkerId, onSelectMarker }) {
  const renderMarkers = listMarkers && listMarkers.length ? listMarkers : markers;
  const activeMarker = renderMarkers.find((m) => m.id === activeMarkerId) || null;
  const hasList = listMarkers && listMarkers.length;
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-base text-white">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-xs text-emerald-200/70 hover:text-emerald-200 flex items-center gap-1"
        >
          🗺️ {showMap ? (lang === "EN" ? "Hide map" : "Karte ausblenden") : (lang === "EN" ? "Show map" : "Karte zeigen")}
        </button>
      </div>

      {showMap && (
        <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} className="h-40 w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFocus center={MAP_CENTER} activeMarker={activeMarker} />
            {renderMarkers.map((marker) => (
              <MarkerItem
                key={marker.id}
                marker={marker}
                lang={lang}
                isActive={marker.id === activeMarkerId}
                onSelectMarker={onSelectMarker}
              />
            ))}
          </MapContainer>
        </div>
      )}

      {hasList ? (
        <div
          className="mt-2 overflow-x-scroll pb-2 scrollbar-hide"
          style={{
            display: 'flex',
            gap: '8px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {listMarkers.map((marker) => {
            const isActive = marker.id === activeMarkerId;
            return (
              <button
                key={marker.id}
                onClick={() => {
                  onSelectMarker?.(marker.id);
                  setShowMap(true);
                }}
                className={cx(
                  "rounded-xl border px-2.5 py-2 text-left text-sm transition shrink-0",
                  "w-[140px] sm:w-[180px] md:w-[220px]",
                  isActive
                    ? "border-emerald-300/50 bg-emerald-400/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <div className="font-medium text-white truncate">{marker.label[lang]}</div>
                {marker.cuisine && (
                  <div className="text-xs text-emerald-100/60 mt-0.5">{marker.cuisine[lang]}</div>
                )}
                <div className="hidden sm:block mt-1 text-xs text-emerald-100/50 truncate">
                  {marker.address[lang]}
                </div>
                {marker.phone && (
                  <div className="hidden md:block mt-0.5 text-xs text-emerald-100/50">
                    {marker.phone}
                  </div>
                )}
                {marker.orderUrl && (
                  <a
                    href={marker.orderUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 inline-block text-xs text-amber-200/80 hover:text-amber-200"
                  >
                    🛵 {lang === "EN" ? "Order" : "Bestellen"}
                  </a>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Chip({ icon, label, onClick, tone = "primary", forceLabel = false, hideIconOnMobile = false }) {
  const tones = {
    primary:
      "bg-gradient-to-b from-emerald-400/20 to-emerald-500/10 text-emerald-100 ring-1 ring-emerald-300/30",
    secondary:
      "bg-gradient-to-b from-white/10 to-white/5 text-white ring-1 ring-white/15",
  };
  const labelClass = forceLabel ? "inline whitespace-nowrap" : "hidden sm:inline whitespace-nowrap";
  const iconClass = hideIconOnMobile ? "text-base hidden sm:inline" : "text-base";
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cx(
        "group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.8)] sm:px-4 sm:py-2.5 sm:text-base",
        tones[tone]
      )}
    >
      <span className={iconClass}>{icon}</span>
      <span className={labelClass}>{label}</span>
      <span className="hidden sm:inline text-sm opacity-70 group-hover:opacity-100">→</span>
    </button>
  );
}

function FlowPanel({ lang, step, stepIndex, totalSteps, onSelect, onBack }) {
  if (!step) return null;
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between text-sm text-emerald-100/70">
        <span>{lang === "EN" ? "Next step" : "Nächster Schritt"}</span>
        <span>
          {lang === "EN" ? "Step" : "Schritt"} {stepIndex + 1}/{totalSteps}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {step.options.map((opt, idx) => (
          <Chip
            key={`${step.id}-${idx}`}
            icon="→"
            label={opt.label[lang]}
            tone="secondary"
            forceLabel
            hideIconOnMobile
            onClick={() => onSelect(opt)}
          />
        ))}
      </div>
      {stepIndex > 0 ? (
        <div className="mt-3">
          <Button variant="ghost" className="text-sm" onClick={onBack}>
            {lang === "EN" ? "Back to previous step" : "Zurück zum vorherigen Schritt"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ServiceFlow({ lang, service, onSubmit }) {
  const payload = { room: "205", date: "", time: "", notes: "" };

  if (!service) return null;

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-base font-semibold text-white">
        {SERVICE_LABELS[service.id][lang]} · {service.price[lang]}
      </div>
      <div className="mt-3 rounded-2xl bg-white/5 p-3 text-sm text-emerald-100/90 ring-1 ring-white/10">
        <div>{lang === "EN" ? "Room: 205" : "Zimmer: 205"}</div>
        <div>{lang === "EN" ? "Date: flexible" : "Datum: flexibel"}</div>
        <div>{lang === "EN" ? "Time: flexible" : "Uhrzeit: flexibel"}</div>
      </div>
      <div className="mt-3">
        <Button onClick={() => onSubmit(payload)}>
          {lang === "EN" ? "Send request" : "Anfrage senden"}
        </Button>
      </div>
    </div>
  );
}

function ReceptionMessageWidget({ lang, topic, initialMessage = "", onSubmit, onCancel }) {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const canSend = room.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-base font-semibold text-white">
        {lang === "EN" ? "Message to reception" : "Nachricht an die Rezeption"}
      </div>
      {topic ? (
        <div className="mt-2 inline-flex rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100 ring-1 ring-emerald-200/30">
          {lang === "EN" ? "Topic: " : "Thema: "}
          {topic[lang]}
        </div>
      ) : null}
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm uppercase tracking-wide text-emerald-100/70">
            {lang === "EN" ? "Room number" : "Zimmernummer"}
          </label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder={lang === "EN" ? "e.g. 205" : "z. B. 205"}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-emerald-100/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
        </div>
        <div>
          <label className="text-sm uppercase tracking-wide text-emerald-100/70">
            {lang === "EN" ? "Your message" : "Deine Nachricht"}
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={lang === "EN" ? "Type your message..." : "Nachricht eingeben..."}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-emerald-100/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onSubmit({ room: room.trim(), message: message.trim(), topic })} disabled={!canSend}>
          {lang === "EN" ? "Send message" : "Nachricht senden"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {lang === "EN" ? "Cancel" : "Abbrechen"}
        </Button>
      </div>
    </div>
  );
}

function ChatDemo({ lang }) {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [serviceResult, setServiceResult] = useState(null);
  const [activeMessageRequest, setActiveMessageRequest] = useState(null);
  const [messageResult, setMessageResult] = useState(null);
  const [lastIntentId, setLastIntentId] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        tone: "bot",
        text:
          lang === "EN"
            ? "Welcome! I’m here to make your stay effortless. What can I help with first?"
            : "Willkommen! Ich mache deinen Aufenthalt so einfach wie möglich. Womit kann ich starten?",
      },
      {
        id: 2,
        type: "system",
        text:
          lang === "EN"
            ? "Tap a chip to continue — no typing needed."
            : "Tippe auf einen Chip — kein Tippen nötig.",
      },
    ]);
    setActiveService(null);
    setServiceResult(null);
    setActiveMessageRequest(null);
    setMessageResult(null);
    setLastIntentId(null);
    setActiveFlow(null);
    setActiveMarkerId(null);
  }, [lang]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, isThinking, serviceResult, activeService, activeMessageRequest, messageResult]);

  const pushMessage = (payload) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, ...payload }]);
  };

  const replyWithBot = (text) => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      pushMessage({ tone: "bot", text });
    }, 700);
  };

  const pushFlowStep = (intentId, stepIndex) => {
    const flow = FLOWS[intentId];
    if (!flow || !flow[stepIndex]) return;
    const step = flow[stepIndex];
    setActiveFlow({ intentId, stepIndex });
    pushMessage({ tone: "bot", text: step.bot[lang] });
    if (step.map) {
      pushMessage({ type: "map", map: step.map });
      setActiveMarkerId(null);
    }
  };

  const startFlow = (intentId, stepIndex = 0) => {
    pushFlowStep(intentId, stepIndex);
  };

  const handleFlowOption = (option) => {
    const userText = option.user?.[lang] || option.label[lang];
    pushMessage({ tone: "user", text: userText });

    if (option.action?.type === "end") {
      setActiveFlow(null);
      return;
    }

    if (option.action?.type === "jump") {
      startFlow(option.action.intentId, 0);
      return;
    }

    if (option.action?.type === "service") {
      setActiveFlow(null);
      setActiveMessageRequest(null);
      setActiveService({ id: option.action.serviceId, price: SERVICE_PRICES[option.action.serviceId] });
      pushMessage({
        tone: "bot",
        text:
          lang === "EN"
            ? "Great — please fill the request details below."
            : "Super — bitte fülle die Details unten aus.",
      });
      return;
    }

    if (option.action?.type === "message") {
      setActiveFlow(null);
      setActiveService(null);
      setMessageResult(null);
      setActiveMessageRequest({
        id: Date.now(),
        topic: option.action.topic || null,
        preset: option.action.preset?.[lang] || "",
      });
      pushMessage({
        tone: "bot",
        text:
          lang === "EN"
            ? "Please enter your room number and message so I can forward it to reception."
            : "Bitte Zimmernummer und Nachricht eingeben, damit ich es an die Rezeption weiterleiten kann.",
      });
      return;
    }

    if (typeof option.next === "number" && activeFlow) {
      const nextIndex = option.next;
      const flow = FLOWS[activeFlow.intentId];
      if (flow && flow[nextIndex]) {
        pushFlowStep(activeFlow.intentId, nextIndex);
      }
    }
  };

  const handleFlowBack = () => {
    if (!activeFlow || activeFlow.stepIndex <= 0) return;
    const prevIndex = activeFlow.stepIndex - 1;
    const flow = FLOWS[activeFlow.intentId];
    if (!flow || !flow[prevIndex]) return;
    pushMessage({
      type: "system",
      tone: "neutral",
      text: lang === "EN" ? "Back to previous step." : "Zurück zum vorherigen Schritt.",
    });
    pushFlowStep(activeFlow.intentId, prevIndex);
  };

  const processUserText = (text) => {
    setServiceResult(null);
    setActiveService(null);
    setActiveMessageRequest(null);
    setMessageResult(null);
    setActiveFlow(null);
    setActiveMarkerId(null);
    pushMessage({ tone: "user", text });

    setIsThinking(true);
    setTimeout(() => {
      const result = matchIntent(text);
      const ranked = rankIntents(text);
      setIsThinking(false);

      if (!result.intent || result.confidence === "none") {
        pushMessage({
          tone: "bot",
          text:
            lang === "EN"
              ? "I want to be precise. Is this about Wi-Fi, laundry, checkout, or a service request?"
              : "Ich möchte es korrekt treffen. Geht es um WLAN, Waschküche, Check-out oder einen Service?",
        });
        if (ranked.length) {
          pushMessage({ type: "suggestions", options: ranked });
        }
        return;
      }

      setLastIntentId(result.intent.id);

      const toneMap = { high: "high", medium: "medium", low: "low" };
      pushMessage({
        type: "system",
        tone: toneMap[result.confidence] || "neutral",
        text:
          lang === "EN"
            ? `Intent: ${result.intent.label[lang]} · ${result.confidence.toUpperCase()}`
            : `Intent: ${result.intent.label[lang]} · ${result.confidence.toUpperCase()}`,
      });

      if (result.confidence === "low" && ranked.length > 1) {
        pushMessage({ type: "suggestions", options: ranked });
      }

      if (FLOWS[result.intent.id]) {
        const startIndex = getFlowStartIndex(result.intent.id, text);
        startFlow(result.intent.id, startIndex);
      } else {
        pushMessage({ tone: "bot", text: result.intent.reply[lang] });
        if (result.intent.service) {
          setActiveService(result.intent.service);
        }
      }
    }, 650);
  };

  const resetToStart = () => {
    setActiveFlow(null);
    setActiveService(null);
    setServiceResult(null);
    setActiveMessageRequest(null);
    setMessageResult(null);
    setLastIntentId(null);
    setActiveMarkerId(null);
    setMessages([
      {
        id: 1,
        tone: "bot",
        text:
          lang === "EN"
            ? "Welcome! I’m here to make your stay effortless. What can I help with first?"
            : "Willkommen! Ich mache deinen Aufenthalt so einfach wie möglich. Womit kann ich starten?",
      },
      {
        id: 2,
        type: "system",
        text:
          lang === "EN"
            ? "Tap a chip to continue — no typing needed."
            : "Tippe auf einen Chip — kein Tippen nötig.",
      },
    ]);
  };

  const chipVariants = {
    hidden: { opacity: 0, y: 10 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
  };

  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-120px)]">
        <div className="border-b border-white/10 px-3 py-1.5 flex items-center justify-between bg-[#0b0f0e]/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/5 ring-1 ring-white/20 grid place-items-center overflow-hidden">
              <img src={miohostChars} alt="miohost" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-medium text-white">miohost</span>
            <span className="text-xs text-emerald-200/60">24/7</span>
          </div>
          <div className="text-xs text-emerald-100/60">205</div>
        </div>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 pb-4 pt-3 space-y-3 min-h-[300px]">
          {messages.map((m) => {
            if (m.type === "system") {
              return (
                <div key={m.id} className="flex">
                  <SystemBubble tone={m.tone}>{m.text}</SystemBubble>
                </div>
              );
            }
            if (m.type === "suggestions") {
              return (
                <div key={m.id} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {m.options.map((opt) => (
                    <SuggestionCard
                      key={opt.intent.id}
                      title={opt.intent.label[lang]}
                      confidence={opt.confidence}
                      onClick={() => processUserText(INTENT_PROMPTS[opt.intent.id][lang])}
                    />
                  ))}
                </div>
              );
            }
            if (m.type === "map") {
              return (
                <div key={m.id} className="w-full">
                  <MapWidgetCard
                    lang={lang}
                    title={m.map.title[lang]}
                    subtitle={m.map.subtitle[lang]}
                    markers={m.map.markers}
                    listMarkers={m.map.listMarkers}
                    activeMarkerId={activeMarkerId}
                    onSelectMarker={setActiveMarkerId}
                  />
                </div>
              );
            }
            return (
              <ChatBubble key={m.id} tone={m.tone}>
                {m.text}
              </ChatBubble>
            );
          })}
          {isThinking ? <TypingIndicator lang={lang} /> : null}
          {serviceResult ? (
            <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/20 text-emerald-100">
              <div className="text-base font-semibold">{lang === "EN" ? "Request sent" : "Anfrage gesendet"}</div>
              <div className="mt-1 text-base">
                {lang === "EN"
                  ? `Room ${serviceResult.room} • ${serviceResult.date || "Flexible"} ${serviceResult.time || ""}`
                  : `Zimmer ${serviceResult.room} • ${serviceResult.date || "Flexibel"} ${serviceResult.time || ""}`}
              </div>
              {serviceResult.notes ? (
                <div className="mt-2 text-sm text-emerald-200/90">{serviceResult.notes}</div>
              ) : null}
            </div>
          ) : null}
          {messageResult ? (
            <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/20 text-emerald-100">
              <div className="text-base font-semibold">{lang === "EN" ? "Message sent" : "Nachricht gesendet"}</div>
              <div className="mt-1 text-base">
                {lang === "EN" ? `Room ${messageResult.room}` : `Zimmer ${messageResult.room}`}
              </div>
              {messageResult.topic ? (
                <div className="mt-2 text-sm text-emerald-200/90">
                  {lang === "EN" ? "Topic: " : "Thema: "}
                  {messageResult.topic[lang]}
                </div>
              ) : null}
              <div className="mt-2 text-sm text-emerald-200/90">{messageResult.message}</div>
            </div>
          ) : null}
          {activeService ? (
            <ServiceFlow
              lang={lang}
              service={activeService}
              onSubmit={(payload) => {
                setServiceResult(payload);
                setActiveService(null);
                replyWithBot(lang === "EN" ? "Booked! We’ll confirm shortly." : "Gebucht! Wir bestätigen gleich.");
              }}
            />
          ) : null}
          {activeMessageRequest ? (
            <ReceptionMessageWidget
              key={activeMessageRequest.id}
              lang={lang}
              topic={activeMessageRequest.topic}
              initialMessage={activeMessageRequest.preset}
              onSubmit={(payload) => {
                setMessageResult(payload);
                setActiveMessageRequest(null);
                replyWithBot(
                  lang === "EN"
                    ? "Thanks — I’ve forwarded your message to reception."
                    : "Danke — ich habe deine Nachricht an die Rezeption weitergeleitet."
                );
              }}
              onCancel={() => {
                setActiveMessageRequest(null);
                replyWithBot(lang === "EN" ? "No problem. Anything else?" : "Alles klar. Sonst noch etwas?");
              }}
            />
          ) : null}
          {activeFlow ? (
            <FlowPanel
              lang={lang}
              step={FLOWS[activeFlow.intentId][activeFlow.stepIndex]}
              stepIndex={activeFlow.stepIndex}
              totalSteps={FLOWS[activeFlow.intentId].length}
              onSelect={handleFlowOption}
              onBack={handleFlowBack}
            />
          ) : null}
        </div>

        <div className="border-t border-white/10 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(lastIntentId && CONTEXT_CHIPS[lastIntentId]
              ? CONTEXT_CHIPS[lastIntentId]
              : QUICK_CHIPS
            ).map((chip, idx) => (
              <button
                key={chip.id}
                onClick={() => processUserText(chip.prompt[lang])}
                className={cx(
                  "rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition",
                  "h-9 w-9 flex items-center justify-center text-lg sm:w-auto sm:px-3 sm:py-1.5 sm:gap-1.5",
                  idx >= 4 && "hidden sm:flex"
                )}
                title={chip.label[lang]}
              >
                <span>{chip.icon}</span>
                <span className="hidden sm:inline text-sm text-emerald-100/90">{chip.label[lang]}</span>
              </button>
            ))}
          </div>
          <button
            onClick={resetToStart}
            className="h-9 px-2 sm:px-3 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center gap-1.5 text-sm text-emerald-100/60 hover:bg-white/10 transition shrink-0"
            title={lang === "EN" ? "Reset" : "Zurück"}
          >
            <span>↩</span>
            <span className="hidden sm:inline">{lang === "EN" ? "Reset" : "Zurück"}</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState(getInitialLang);
  const [scanned, setScanned] = useState(false);
  const [step, setStep] = useState("welcome");
  const [introPhase, setIntroPhase] = useState("splash");

  useEffect(() => {
    const s = getScannedFromUrlOrStorage();
    setScanned(s);
    if (s) setStep("chat");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIntroPhase("video"), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.lang, lang);
  }, [lang]);

  const t = useMemo(() => {
    return {
      notScannedTitle: {
        EN: "Scan a QR code to start chatting",
        DE: "QR-Code scannen, um zu chatten",
      }[lang],
      notScannedSub: {
        EN: "Guests scan in-room QR codes to access instant help.",
        DE: "Gäste scannen den QR-Code im Zimmer für sofortige Hilfe.",
      }[lang],
      continueHint: {
        EN: "Tip: click “Simulate QR scan” above.",
        DE: "Tipp: Klicke oben auf „Simulate QR scan“.",
      }[lang],
    };
  }, [lang]);

  return (
    <div className="min-h-screen bg-[#0b0f0e] text-white font-['Manrope']">
      <div className="fixed top-0 right-0 z-50 h-40 w-40 pointer-events-none">
        <div className="absolute top-6 right-[-52px] rotate-45 rounded-bl-2xl rounded-tr-2xl bg-emerald-50 ring-1 ring-emerald-200/80 py-1 text-[10px] md:text-xs uppercase tracking-[0.3em] text-emerald-900 shadow-[0_10px_30px_-18px_rgba(16,185,129,0.65)] overflow-hidden w-[180px]">
          <div className="hotel-marquee whitespace-nowrap px-6">
            <span className="inline-block">Lindenhof Hotel</span>
            <span className="inline-block ml-8">•</span>
            <span className="inline-block ml-8">Lindenhof Hotel</span>
            <span className="inline-block ml-8">•</span>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Manrope:wght@400;500;600;700&display=swap');
        .mio-marker { position: relative; }
        .mio-marker__pulse {
          position: absolute;
          inset: -8px;
          border-radius: 999px;
          border: 1px solid;
          opacity: 0.6;
          animation: mioPulse 1.8s ease-out infinite;
        }
        @keyframes mioPulse {
          0% { transform: scale(0.7); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { opacity: 0; }
        }
        .hotel-marquee {
          display: inline-block;
          animation: hotelMarquee 8s linear infinite;
        }
        @keyframes hotelMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <AnimatePresence>
        {introPhase !== "done" ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#0b0f0e]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {introPhase === "splash" ? (
              <div className="relative text-center">
                <motion.div
                  className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-['Fraunces']"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  miohost
                </motion.div>
                <motion.div
                  className="mt-2 text-base uppercase tracking-[0.4em] text-emerald-200/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  virtual receptionist
                </motion.div>
                <motion.div
                  className="mt-6 h-px w-40 bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
                />
                <motion.div
                  className="pointer-events-none absolute -inset-20 rounded-full bg-emerald-500/10 blur-[120px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            ) : (
              <motion.div
                className="relative"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="h-72 w-72 md:h-96 md:w-96 rounded-full overflow-hidden ring-2 ring-emerald-200/40 bg-black/40">
                  <video
                    src="/mioHost_runway.mp4"
                    autoPlay
                    playsInline
                    onEnded={() => setIntroPhase("done")}
                    onError={() => setIntroPhase("done")}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-amber-400/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-sky-400/10 blur-[120px]" />

        <div className="mx-auto max-w-5xl px-4 py-3 md:py-4">
          {!scanned ? (
            <Header
              lang={lang}
              setLang={setLang}
              scanned={scanned}
              setScanned={setScanned}
              setStep={setStep}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/5 ring-1 ring-white/20 grid place-items-center overflow-hidden">
                  <img src={miohostChars} alt="miohost" className="h-full w-full object-cover" />
                </div>
                <span className="text-base font-semibold text-white font-['Fraunces']">miohost</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  className="px-2.5 py-1 text-sm"
                  onClick={() => {
                    const next = lang === LANGS.EN ? LANGS.DE : LANGS.EN;
                    setLang(next);
                    localStorage.setItem(LS_KEYS.lang, next);
                  }}
                >
                  🌐 {lang === LANGS.EN ? "DE" : "EN"}
                </Button>
                <Button
                  variant="subtle"
                  className="px-2.5 py-1 text-sm"
                  onClick={() => {
                    setScanned(false);
                    localStorage.setItem(LS_KEYS.scanned, "0");
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 md:mt-4">
            {!scanned ? (
              <Card className="p-7 md:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                      {t.notScannedTitle}
                    </h2>
                    <p className="mt-2 text-base text-emerald-100/80">{t.notScannedSub}</p>
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 text-amber-100 ring-1 ring-amber-200/30 px-3 py-1.5 text-sm">
                        📷 {t.continueHint}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-20 w-20 rounded-3xl bg-white/5 ring-1 ring-white/10 grid place-items-center">
                      <span className="text-3xl">🔎</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {step === "chat" ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <ChatDemo lang={lang} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>
          {!scanned && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem(LS_KEYS.lang);
                  localStorage.removeItem(LS_KEYS.scanned);
                  window.location.href = window.location.pathname;
                }}
              >
                ↩️ {t.reset}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
