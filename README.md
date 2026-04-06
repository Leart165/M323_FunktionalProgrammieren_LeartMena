# M323 Funktionalprogrammierung WM 2026

Webprojekt zur FIFA WM 2026 mit zwei Modi:

- `Simulation`: Gruppenspiele automatisch simulieren
- `Prediction`: eigene Resultate eingeben und Tabellen berechnen

Das Frontend ist in React/Vite gebaut, das Backend als ASP.NET Core Minimal API.

## Features

- korrekte WM-2026-Gruppen A-L
- offizielle Gruppenspiele mit Datum und Stadion
- API für Teams
- API für Gruppen
- API für Stadien
- API für Matches
- API für Länderstärken / Ratings
- Berechnung von Gruppentabellen über Pure Functions
- Berechnung der besten Drittplatzierten über Pure Functions
- Gruppensimulation auf Basis von Länderstärken
- Predictor-Modus mit speicherbaren Gruppentipps

## Setup

Voraussetzungen:

- .NET 8
- Node.js / npm

Starten:

```bash
dotnet run --project backend/Backend.Api/Backend.Api.csproj
```

Das Backend baut das Frontend automatisch und liefert danach die gebaute Vite-App aus.

## Wichtige API-Endpunkte

- `GET /api/tournament/teams`
- `GET /api/tournament/groups`
- `GET /api/tournament/stadiums`
- `GET /api/tournament/matches`
- `GET /api/tournament/strengths`
- `GET /api/simulation/groups`
- `GET /api/simulation/groups/{id}`
- `POST /api/simulation/groups/{id}/simulate`
- `POST /api/simulation/simulate-all`
- `GET /api/simulation/best-third`
- `GET /api/prediction/groups`
- `GET /api/prediction/groups/{id}`
- `PUT /api/prediction/groups/{id}/scores`
- `DELETE /api/prediction/groups/{id}/scores`
- `GET /api/prediction/best-third`

## Architektur

### Backend

- `TournamentDataService`
  - reine Seed-Daten: Gruppen, Teams, Stadien, Fixtures, Knockout-Slots, Ratings
- `TournamentCalculations`
  - reine Fachlogik
  - keine Seiteneffekte
  - berechnet Tabellen, Punkte, Tore, Tordifferenzen und Best-Third-Ranking
  - simuliert Spiele als pure Funktion anhand von Eingabeparametern
- `TournamentStateService`
  - Systemgrenze für mutierbaren Zustand
  - speichert Prediction- und Simulation-Scores im Speicher
  - ruft die Pure Functions aus `TournamentCalculations` auf
- `Api/*`
  - HTTP-Layer
  - kein Fachwissen über Tabellenregeln oder Simulationen

### Frontend

- `simulation/*`
  - lädt Gruppen, Tabellen und Simulationsergebnisse aus dem Backend
- `prediction/*`
  - lädt Gruppendaten
  - sendet User-Predictions an das Backend
  - zeigt neu berechnete Tabellen direkt an

## Funktionale Designentscheidungen

Dieses Projekt ist bewusst funktional aufgebaut:

- `Pure Functions`
  - Tabellenberechnung, Ranking, Sortierung, Best-Third-Auswertung und Match-Simulation sind in `TournamentCalculations` als reine Funktionen umgesetzt.
- `No Side Effects in Business Logic`
  - Seiteneffekte wie HTTP, In-Memory-State und Random-Seed-Erzeugung liegen nur im API-/State-Layer.
- `Immutability`
  - Eingabedaten werden nicht direkt verändert.
  - Neue Dictionaries, Records und Projektionen werden aus alten Zuständen erzeugt.
- `Higher-Order Functions`
  - `map`, `filter`, `aggregate`, `orderBy`, `selectMany` und `groupBy` werden gezielt für Transformationen verwendet.
- `Function Composition`
  - große Berechnungen sind in kleine Teilfunktionen zerlegt, z. B.:
    - Projection bauen
    - Gruppentabelle berechnen
    - Fixture-Ergebnis anwenden
    - Best-Third-Liste ableiten
    - DTOs erzeugen
- `Type Safety`
  - alle zentralen Datenstrukturen sind über Records und TS-Interfaces typisiert
  - keine `any`-Typen in der Fachlogik

## Testing / Verifikation

Build prüfen:

```bash
dotnet build backend/Backend.Api/Backend.Api.csproj
```

Dabei wird auch das Frontend gebaut.

## Bekannte Grenzen

- Simulation- und Prediction-Zustand werden aktuell nur im Speicher gehalten
- Knockout-Bracket ist aktuell als offizielles Slot-Template hinterlegt, aber noch nicht vollständig aus den berechneten Gruppenergebnissen befüllt
