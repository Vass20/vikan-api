using System;

namespace VikanMatrimony.WebApi.Models
{
    public class Message
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SenderId { get; set; } = null!;
        public Profile Sender { get; set; } = null!;

        public string ReceiverId { get; set; } = null!;
        public Profile Receiver { get; set; } = null!;

        public string Text { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
