using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembershipController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MembershipController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("plans")]
        [AllowAnonymous]
        public IActionResult GetPlans()
        {
            var plans = new List<object>
            {
                new {
                    Name = "Free Member",
                    Price = 0,
                    Duration = "Forever",
                    Features = new[] {
                        "Create your profile with up to 3 photos",
                        "Browse verified bride & groom profiles",
                        "Express up to 5 interests per day",
                        "Basic search filters",
                        "Receive match recommendations",
                        "View limited profile details"
                    }
                },
                new {
                    Name = "Silver Member",
                    Price = 1499,
                    Duration = "1 Month",
                    Features = new[] {
                        "Everything in Free",
                        "Unlimited interest requests",
                        "Send up to 30 chat messages daily",
                        "View horoscope compatibility",
                        "Advanced search filters",
                        "See who viewed your profile",
                        "Email & WhatsApp notifications",
                        "Standard customer support"
                    }
                },
                new {
                    Name = "Gold Member",
                    Price = 2499,
                    Duration = "3 Months",
                    Features = new[] {
                        "Everything in Silver",
                        "Unlimited chat messaging",
                        "Unlock up to 20 direct contact details",
                        "Profile highlighted in search results",
                        "Priority match recommendations",
                        "Unlimited profile views",
                        "Read message status",
                        "Priority customer support"
                    }
                },
                new {
                    Name = "Diamond Member",
                    Price = 4999,
                    Duration = "6 Months",
                    Features = new[] {
                        "Everything in Gold",
                        "Unlock up to 60 direct contact details",
                        "Monthly profile boost",
                        "Verified Profile Badge",
                        "Advanced compatibility suggestions",
                        "Priority profile visibility",
                        "Access to exclusive premium profiles",
                        "Faster profile verification"
                    }
                },
                new {
                    Name = "Royal Platinum",
                    Price = 8999,
                    Duration = "12 Months",
                    Features = new[] {
                        "Everything in Diamond",
                        "Unlimited direct contact unlocks",
                        "Dedicated Relationship Manager",
                        "Personalized matchmaking assistance",
                        "Permanent profile highlight",
                        "Private photo access controls",
                        "Highest search ranking",
                        "VIP priority support",
                        "Exclusive premium profile recommendations",
                        "Free profile verification & boost",
                        "Early access to new premium features"
                    }
                }
            };

            return Ok(plans);
        }

        [HttpPost("upgrade")]
        public async Task<IActionResult> UpgradeMembership([FromBody] UpgradeRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Profile not found");

            profile.MembershipType = request.MembershipType;
            profile.IsPremium = request.MembershipType != "Free Member" && request.MembershipType != "Free";

            // If upgraded to Diamond or Royal Platinum, make sure they get verified badge status
            if (request.MembershipType == "Diamond Member" || request.MembershipType == "Royal Platinum")
            {
                profile.IsVerified = true;
            }

            await _context.SaveChangesAsync();
            return Ok(profile);
        }
    }

    public class UpgradeRequest
    {
        public string MembershipType { get; set; } = "Free";
    }
}
