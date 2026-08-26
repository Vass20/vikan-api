using System;

namespace VikanMatrimony.WebApi.Models
{
    public class SupportTicket
    {
        public string Id { get; set; } = null!;
        public string? ProfileId { get; set; } // Nullable if an unauthenticated visitor submits
        public Profile? Profile { get; set; }
        
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string Message { get; set; } = null!;
        
        public string TicketNumber { get; set; } = null!; // e.g. VIK-TKT-123456
        public string Status { get; set; } = "Open"; // Open, InProgress, Resolved, Closed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
