using Backend.Api.DTOs;
using Backend.Api.Services;

namespace Backend.Api.Controllers;

public static class PredictionController
{
    public static RouteGroupBuilder MapPredictionController(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/prediction");

        group.MapGet("/groups", (TournamentStateService state) =>
            Results.Ok(state.GetPredictionProjection().Groups.Select(group => new PredictionGroupListItemDto(group.Id, group.Venue, group.Teams)).ToList()));

        group.MapGet("/groups/{id}", (string id, TournamentStateService state) =>
        {
            var details = state.GetPredictionProjection().PredictionGroups.TryGetValue(id, out var groupDetails)
                ? groupDetails
                : null;
            return details is null ? Results.NotFound() : Results.Ok(details);
        });

        group.MapPut("/groups/{id}/scores", (string id, PredictionGroupUpdateRequest request, TournamentStateService state) =>
        {
            var details = state.SavePredictionGroup(id, request.Scores);
            return details is null ? Results.NotFound() : Results.Ok(details);
        });

        group.MapDelete("/groups/{id}/scores", (string id, TournamentStateService state) =>
        {
            var details = state.ClearPredictionGroup(id);
            return details is null ? Results.NotFound() : Results.Ok(details);
        });

        group.MapGet("/knockout", (TournamentStateService state) => Results.Ok(state.GetPredictionProjection().Knockout));
        group.MapPut("/knockout/scores", (PredictionGroupUpdateRequest request, TournamentStateService state) =>
            Results.Ok(state.SavePredictionKnockout(request.Scores)));
        group.MapDelete("/knockout/scores", (TournamentStateService state) =>
            Results.Ok(state.ClearPredictionKnockout()));

        group.MapGet("/best-third", (TournamentStateService state) => Results.Ok(state.GetPredictionProjection().BestThird));

        return group;
    }
}
