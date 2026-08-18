using Microsoft.AspNetCore.Identity;
using System;

namespace VikanMatrimony.WebApi.Models
{
    public class User : IdentityUser
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Profile? Profile { get; set; }
    }
}
