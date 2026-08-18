using System;

namespace VikanMatrimony.WebApi.Models
{
    public class ProfileView
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string ViewerProfileId { get; set; } = null!;
        public Profile ViewerProfile { get; set; } = null!;

        public string ViewedProfileId { get; set; } = null!;
        public Profile ViewedProfile { get; set; } = null!;

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
