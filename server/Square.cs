using System.Text.Json.Serialization;

// Represents a single square with unique ID and color.
public class Square
{
  // Unique identifier for the square.
  public int Id { get; set; }

  // Color of the square in string format (e.g. "red", "blue").
  [JsonPropertyName("color")] 
  public string Color { get; set; } = "#000000";
}
