using System;

namespace VikanMatrimony.WebApi.Models
{
    public class Notification
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ProfileId { get; set; } = null!;
        public Profile Profile { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Type { get; set; } = "system"; // interest | message | visitor | verification | system
        public string? Link { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
