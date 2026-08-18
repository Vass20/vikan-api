using System;

namespace VikanMatrimony.WebApi.Models
{
    public class ShortlistedProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = null!;
        public Profile UserProfile { get; set; } = null!;

        public string ShortlistedProfileId { get; set; } = null!;
        public Profile TargetProfile { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
