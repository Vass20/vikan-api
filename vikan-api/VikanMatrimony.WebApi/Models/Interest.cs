using System;

namespace VikanMatrimony.WebApi.Models
{
    public class Interest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SenderId { get; set; } = null!;
        public Profile Sender { get; set; } = null!;
        
        public string ReceiverId { get; set; } = null!;
        public Profile Receiver { get; set; } = null!;

        public string Status { get; set; } = "Pending";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }
    }
}
