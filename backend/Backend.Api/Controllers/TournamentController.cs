using Backend.Api.Services;

namespace Backend.Api.Controllers;

public static class TournamentController
{
    public static RouteGroupBuilder MapTournamentController(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tournament");

        group.MapGet("/teams", (TournamentDataService data) => Results.Ok(data.GetTeams()));
        group.MapGet("/groups", (TournamentDataService data) => Results.Ok(data.GetGroups()));
        group.MapGet("/stadiums", (TournamentDataService data) => Results.Ok(data.GetStadiums()));
        group.MapGet("/matches", (TournamentDataService data) => Results.Ok(data.GetMatches()));
        group.MapGet("/strengths", (TournamentDataService data) => Results.Ok(data.GetStrengths().Values.OrderByDescending(item => item.Rating).ToList()));

        return group;
    }
}
