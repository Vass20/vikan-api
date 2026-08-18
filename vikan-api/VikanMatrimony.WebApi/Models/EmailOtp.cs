using System;
using System.ComponentModel.DataAnnotations;

namespace VikanMatrimony.WebApi.Models
{
    public class EmailOtp
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(6)]
        public string Otp { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
