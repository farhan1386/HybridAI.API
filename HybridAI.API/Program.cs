using Microsoft.Extensions.AI;

using ChatMessage = Microsoft.Extensions.AI.ChatMessage;
using ChatRole = Microsoft.Extensions.AI.ChatRole;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:61121")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IChatClient>(sp =>
    new OllamaChatClient(new Uri("http://localhost:11434"), "llama3.2:latest"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.MapPost("/api/chat/stream", async (ChatRequest request, HttpContext context, IChatClient client) =>
{
    context.Response.ContentType = "text/plain; charset=utf-8";
    context.Response.Headers.CacheControl = "no-cache";

    var chatHistory = request.History.Select(msg =>
        new ChatMessage(msg.Role == "user" ? ChatRole.User : ChatRole.Assistant, msg.Content)
    ).ToList();

    chatHistory.Insert(0, new ChatMessage(ChatRole.System, "You are an elite C# developer. Output your code blocks using beautiful standard markdown indentation and normal structural line breaks."));

    try
    {
        await foreach (var chunk in client.GetStreamingResponseAsync(chatHistory))
        {
            if (!string.IsNullOrEmpty(chunk.Text))
            {
                await context.Response.WriteAsync(chunk.Text);
                await context.Response.Body.FlushAsync();
            }
        }
    }
    catch (Exception ex)
    {
        await context.Response.WriteAsync($"\n[Pipeline Error: {ex.Message}]\n");
        await context.Response.Body.FlushAsync();
    }
});

app.Run();

public record ChatMessageDto(string Role, string Content);
public record ChatRequest(string Provider, List<ChatMessageDto> History);
