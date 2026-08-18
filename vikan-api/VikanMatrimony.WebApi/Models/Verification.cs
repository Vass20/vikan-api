using System;

namespace VikanMatrimony.WebApi.Models
{
    public class Verification
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProfileId { get; set; } = null!;
        public Profile Profile { get; set; } = null!;

        public string DocumentType { get; set; } = string.Empty;
        public string DocumentUrl { get; set; } = string.Empty;
        public string FaceScanUrl { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
