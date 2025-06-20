var builder = WebApplication.CreateBuilder(args);

// Register all necessary services
builder.Services.AddControllers();

// Define CORS policy for allowing frontend access (React on localhost:5173)
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
  });
});

var app = builder.Build();

// Enable CORS for frontend requests
app.UseCors("AllowFrontend");

// Automatically map all controllers like SquareController
app.MapControllers();

// Run the application
app.Run();