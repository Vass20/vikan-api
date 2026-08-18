using System;

namespace VikanMatrimony.WebApi.Models
{
    public class ProfilePhoto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProfileId { get; set; } = null!;
        public Profile Profile { get; set; } = null!;
        public string Url { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
