# M323 Funktionalprogrammierung WM 2026

Webprojekt zur FIFA WM 2026 mit funktional aufgebautem Backend und React-Frontend.

Die Anwendung hat zwei Hauptmodi:

- `Simulation`: Gruppenspiele und Knockout-Runden automatisch simulieren
- `Prediction`: eigene Resultate für Gruppen und Knockout-Bracket eingeben

Das Frontend läuft mit React/Vite, das Backend mit ASP.NET Core Minimal API.

## Projektziel

Das Projekt soll nicht nur funktionieren, sondern zentrale Konzepte der funktionalen Programmierung praktisch zeigen:

- Fachlogik als `Pure Functions`
- klare Trennung von Berechnung und Seiteneffekten
- immutable Datenflüsse
- sinnvoller Einsatz von Higher-Order Functions
- saubere Typisierung im Backend und Frontend

## Features

- finale WM-2026-Gruppen `A-L`
- Gruppenspiele mit Datum und Stadion
- Knockout-Bracket von `Round of 32` bis `Final Stage`
- Eigene Backend-Endpunkte für Teams, Gruppen, Stadien, Matches und Teamstärken
- Berechnung von Gruppentabellen, Punkten, Toren und Tordifferenz
- Berechnung der acht besten Drittplatzierten
- automatische Qualifikation ins Knockout-Bracket
- Gruppensimulation anhand von Teamstärken
- Knockout-Simulation Runde für Runde oder komplett
- Predictor-Modus für Gruppen
- Predictor-Modus für Knockout-Runden
- automatische Speicherung im Predictor

## Setup

Voraussetzungen:

- `.NET 8`
- `Node.js` und `npm`

Projekt starten:

```bash
dotnet run --project backend/Backend.Api/Backend.Api.csproj
```

Das Backend baut das Frontend automatisch und liefert danach die gebaute Vite-App aus.

## Wichtige API-Endpunkte

Allgemeine Turnierdaten:

- `GET /api/tournament/teams`
- `GET /api/tournament/groups`
- `GET /api/tournament/stadiums`
- `GET /api/tournament/matches`
- `GET /api/tournament/strengths`

Simulation:

- `GET /api/simulation/groups`
- `GET /api/simulation/groups/{id}`
- `POST /api/simulation/groups/{id}/simulate`
- `POST /api/simulation/simulate-all`
- `POST /api/simulation/reset`
- `GET /api/simulation/knockout`
- `POST /api/simulation/knockout/simulate-round`
- `POST /api/simulation/knockout/simulate-all`
- `POST /api/simulation/knockout/reset`
- `GET /api/simulation/best-third`

Prediction:

- `GET /api/prediction/groups`
- `GET /api/prediction/groups/{id}`
- `PUT /api/prediction/groups/{id}/scores`
- `DELETE /api/prediction/groups/{id}/scores`
- `GET /api/prediction/knockout`
- `PUT /api/prediction/knockout/scores`
- `DELETE /api/prediction/knockout/scores`
- `GET /api/prediction/best-third`

## Architektur

### Backend

- `TournamentDataService`
  - liefert feste Seed-Daten für Teams, Gruppen, Stadien, Gruppenspiele, Knockout-Templates und Ratings
  - enthält keine Berechnungslogik

- `TournamentCalculations`
  - funktionaler Kern der Anwendung
  - berechnet Gruppentabellen, Best-Third-Ranking, Knockout-Bracket und Simulationsergebnisse
  - arbeitet nur mit Eingabeparametern und Rückgabewerten

- `TournamentStateService`
  - kapselt mutierbaren In-Memory-State
  - trennt Prediction- und Simulation-State
  - ist die Systemgrenze zwischen reiner Fachlogik und veränderlichem Zustand

- `Api/*`
  - Minimal-API-Endpunkte
  - übernehmen HTTP, Requests und Responses
  - enthalten keine eigentliche Tabellen- oder Bracket-Logik

### Frontend

- `features/simulation/*`
  - Gruppenansicht, Gruppendetails und Knockout-Simulation

- `features/prediction/*`
  - Gruppentipps, Best-Third-Ansicht und Predictor-Bracket

- `components/*`
  - wiederverwendbare UI-Bausteine wie Flaggen

## Funktionale Designentscheidungen

### Pure Functions & No Side Effects

Die zentrale Fachlogik liegt in `backend/Backend.Api/Services/TournamentCalculations.cs`.

Beispiele:

- Gruppentabelle aus Fixtures und Scores berechnen
- Punkte pro Resultat ableiten
- Best-Third-Ranking sortieren
- Knockout-Slots aus Gruppenständen und Match-Siegern auflösen
- Simulation eines Matches aus Stärkewerten berechnen

Diese Funktionen verändern keinen globalen Zustand. Seiteneffekte wie HTTP, In-Memory-State und zufällige Seed-Erzeugung liegen außerhalb dieser Logik.

### Immutability

Die Berechnungen erzeugen neue Zustände statt bestehende zu verändern.

Beispiele:

- neue Dictionaries statt In-Place-Updates
- neue Records über `with`
- neue Projektionen für Gruppen, Tabellen und Knockout-Bracket

### Higher-Order Functions

Im Backend werden gezielt Higher-Order Functions genutzt, zum Beispiel:

- `Select`
- `Where`
- `Aggregate`
- `OrderBy` / `ThenBy`
- `GroupBy`
- `ToDictionary`
- `SelectMany`

Damit entsteht eine deklarative Datenverarbeitung statt einer rein imperativen Schleifenlogik.

### Function Composition

Die Berechnung ist in kleine Funktionen zerlegt und wird daraus zusammengesetzt:

- `BuildProjection`
- `BuildGroupResult`
- `ApplyFixtureResult`
- `BuildBestThirdTable`
- `BuildKnockoutBracket`
- `ResolveKnockoutSlot`
- `SimulateMatch`

Das ergibt klar getrennte Datenpipelines für Gruppen, Rankings und Knockout-Runden.

### Closures

Im Frontend werden Closures bewusst eingesetzt, zum Beispiel für:

- debounced Autosave im Predictor
- Event-Handler pro Spiel und pro Eingabefeld
- lokale Effekte innerhalb von React-Komponenten

### Type Safety

Typisierung ist ein zentraler Teil des Designs:

- C# `record`s für Domain-Modelle und DTOs
- TypeScript-Interfaces für Gruppen, Fixtures, Tabellen und Knockout-Daten
- keine `any`-Typen in der eigentlichen Fachlogik

## Testing / Verifikation

Build und Typsicherheit prüfen:

```bash
dotnet build backend/Backend.Api/Backend.Api.csproj
```

Dabei wird auch das Frontend gebaut:

- Backend-C#-Build
- TypeScript-Check über `tsc -b`
- Produktionsbuild über `vite build`

Manuell geprüft wurden insbesondere:

- Gruppentabellen nach User-Eingaben
- Best-Third-Ranking
- Freigabe des Knockout-Brackets erst nach vollständiger Gruppenphase
- Knockout-Verkettung gemäß offiziellem Matchpfad
- Reset- und Autosave-Verhalten

## Bekannte Grenzen

- Prediction- und Simulation-State werden aktuell nur im Speicher gehalten
- es gibt noch keine separaten automatisierten Unit-Tests für `TournamentCalculations`
- die Simulation ist bewusst vereinfacht und basiert auf einem Stärke-/Torerwartungsmodell statt auf einem komplexen statistischen Modell
