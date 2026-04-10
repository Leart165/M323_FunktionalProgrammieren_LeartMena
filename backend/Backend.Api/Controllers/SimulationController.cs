using Backend.Api.Services;

namespace Backend.Api.Controllers;

public static class SimulationController
{
    public static RouteGroupBuilder MapSimulationController(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/simulation");

        group.MapGet("/groups", (TournamentStateService state) => Results.Ok(state.GetSimulationProjection().Groups));

        group.MapGet("/groups/{id}", (string id, TournamentStateService state) =>
        {
            var details = state.GetSimulationProjection().SimulationGroups.TryGetValue(id, out var groupDetails)
                ? groupDetails
                : null;
            return details is null ? Results.NotFound() : Results.Ok(details);
        });

        group.MapPost("/groups/{id}/simulate", (string id, TournamentStateService state) =>
        {
            var details = state.SimulateGroup(id);
            return details is null ? Results.NotFound() : Results.Ok(details);
        });

        group.MapPost("/simulate-all", (TournamentStateService state) => Results.Ok(state.SimulateAllGroups().Groups));

        group.MapPost("/reset", (TournamentStateService state) =>
        {
            state.ResetSimulation();
            return Results.NoContent();
        });

        group.MapPost("/knockout/simulate-round", (TournamentStateService state) => Results.Ok(state.SimulateNextKnockoutRound()));
        group.MapPost("/knockout/simulate-all", (TournamentStateService state) => Results.Ok(state.SimulateAllKnockout()));
        group.MapPost("/knockout/reset", (TournamentStateService state) =>
        {
            state.ResetKnockout();
            return Results.NoContent();
        });

        group.MapGet("/knockout", (TournamentStateService state) => Results.Ok(state.GetSimulationProjection().Knockout));

        group.MapGet("/best-third", (TournamentStateService state) => Results.Ok(state.GetSimulationProjection().BestThird));

        return group;
    }
}
