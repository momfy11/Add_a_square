using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class SquareController : ControllerBase
{
  // Path to JSON file used for storage
  private readonly string filepath = "square.json";

  // Get all saved squares.
  [HttpGet]
  public IActionResult Get()
  {
    try
    {
      var squares = LoadSquares();
      Console.WriteLine($"📦 Retrieved {squares.Count} squares from JSON.");
      return Ok(squares);
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error while loading squares: {ex.Message}");
    }
  }

  // Add a new square if its ID does not already exist.
  [HttpPost]
  public IActionResult Post([FromBody] Square newSquare)
  {
    try
    {
      var squares = LoadSquares();

      // Check for duplicate ID
      if (squares.Any(s => s.Id == newSquare.Id))
      {
        Console.WriteLine($"❌ Duplicate ID: {newSquare.Id} already exists.");
        return Conflict($"A square with ID {newSquare.Id} already exists.");
      }

      squares.Add(newSquare);
      SaveSquares(squares);

      Console.WriteLine($"✅ Square added: ID = {newSquare.Id}, Color = {newSquare.Color}");
      return Ok(newSquare);
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error while saving square: {ex.Message}");
    }
  }

  // Clear all saved squares.
  [HttpDelete("reset")]
  public IActionResult Reset()
  {
    try
    {
      SaveSquares(new List<Square>()); // Save empty list
      return Ok("All squares have been deleted.");
    }
    catch (Exception ex)
    {
      return StatusCode(500, $"Error while resetting squares: {ex.Message}");
    }
  }



  // Load all squares from file. If file does not exist, return empty list.
  private List<Square> LoadSquares()
  {
    if (!System.IO.File.Exists(filepath))
      return new List<Square>();

    var json = System.IO.File.ReadAllText(filepath);
    return JsonSerializer.Deserialize<List<Square>>(json) ?? new List<Square>();
  }

  // Save all squares to JSON file with indentation.
   private void SaveSquares(List<Square> squares)
  {
    var json = JsonSerializer.Serialize(squares, new JsonSerializerOptions { WriteIndented = true });
    System.IO.File.WriteAllText(filepath, json);
  }
}
