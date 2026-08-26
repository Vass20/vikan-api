using System;

namespace VikanMatrimony.WebApi.Models
{
    public class PaymentTransaction
    {
        public string Id { get; set; } = null!; // Internal Transaction ID (GUID)
        public string ProfileId { get; set; } = null!; // User Profile ID
        public Profile Profile { get; set; } = null!;
        
        public string PlanName { get; set; } = null!; // "Silver", "Gold", "Diamond"
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        
        public string GatewayOrderId { get; set; } = null!; // Razorpay Order ID (order_...)
        public string? GatewayPaymentId { get; set; } // Razorpay Payment ID (pay_...)
        
        public string Status { get; set; } = "Pending"; // Pending, Paid, Failed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
    }
}
