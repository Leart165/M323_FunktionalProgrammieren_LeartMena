var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/home-content", () =>
{
    var response = new HomeContentResponse(
        Countdown: new[]
        {
            new CountdownValue("Days", "12"),
            new CountdownValue("Hrs", "08"),
            new CountdownValue("Mins", "42"),
        },
        Ticker: new[]
        {
            new TickerItem("BREAKING NEWS:", "text-red-500", "BRAZIL ANNOUNCE SQUAD FOR THE FINALS...", true),
            new TickerItem("MARKET:", "text-primary", "FRANCE ODZ FAVORITES AT 3:1...", false),
            new TickerItem("UPDATE:", "text-gray-400", "NEW LEGENDARY CARDS DROPPING AT 6PM...", false),
        }
    );

    return Results.Ok(response);
})
.WithName("GetHomeContent")
.WithOpenApi();

app.MapFallbackToFile("index.html");

app.Run();

internal sealed record CountdownValue(string Label, string Value);

internal sealed record TickerItem(string Category, string CategoryClassName, string Message, bool HasLiveDot);

internal sealed record HomeContentResponse(IReadOnlyList<CountdownValue> Countdown, IReadOnlyList<TickerItem> Ticker);
