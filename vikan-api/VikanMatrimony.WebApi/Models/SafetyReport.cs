using System;

namespace VikanMatrimony.WebApi.Models
{
    public class SafetyReport
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ReporterId { get; set; } = null!;
        public Profile Reporter { get; set; } = null!;

        public string ReportedId { get; set; } = null!;
        public Profile Reported { get; set; } = null!;

        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Unresolved";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
