# Backend (.NET)

Projekt: `Backend.Api` (ASP.NET Core mit Controller-Endpunkten)

## Start
1. .NET 8 SDK installieren
2. `cd Backend.Api`
3. `dotnet restore`
4. `dotnet run`

## Struktur (aktuell)
- `Controllers/`
  - HTTP-Endpunkte (`SimulationController`, `PredictionController`, `TournamentController`)
- `DTOs/`
  - gemeinsame C#-Records (Response-/Request-Typen und Turniertypen)
- `Services/`
  - `TournamentSeedData` (feste Seed-Daten)
  - `TournamentDataService` (Datenzugriff/Mapping)
  - `TournamentCalculations` (Pure Functions)
  - `TournamentStateService` (In-Memory-Status für Simulation/Prediction)
