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
                        "Create your profile",
                        "Upload up to 3 photos",
                        "Browse bride & groom profiles",
                        "Basic search filters",
                        "Send up to 5 interests/day",
                        "Receive interests",
                        "View basic profile information",
                        "❌ No chat",
                        "❌ No contact details"
                    }
                },
                new {
                    Name = "Silver Member",
                    Price = 1499,
                    Duration = "1 Month",
                    Features = new[] {
                        "Everything in Free",
                        "Upload up to 5 photos",
                        "Advanced search filters",
                        "Unlimited interest requests",
                        "Limited chat — 20 messages/day",
                        "See who viewed your profile",
                        "Standard customer support"
                    }
                },
                new {
                    Name = "Gold Member",
                    Price = 2499,
                    Duration = "3 Months",
                    Features = new[] {
                        "Everything in Silver",
                        "Upload up to 8 photos",
                        "Unlimited chat",
                        "Unlock up to 10 contact details",
                        "Profile highlighted in search",
                        "Priority profile visibility",
                        "Priority customer support"
                    }
                },
                new {
                    Name = "Diamond Member",
                    Price = 4999,
                    Duration = "6 Months",
                    Features = new[] {
                        "Everything in Gold",
                        "Upload up to 10 photos",
                        "Unlock up to 30 contact details",
                        "Profile boost",
                        "Verified profile badge",
                        "Higher profile visibility",
                        "Priority support"
                    }
                },
                new {
                    Name = "Royal Platinum",
                    Price = 8999,
                    Duration = "12 Months",
                    Features = new[] {
                        "Everything in Diamond",
                        "Upload up to 15 photos",
                        "Unlimited contact detail access",
                        "Maximum profile visibility",
                        "Premium profile highlight",
                        "Profile boost",
                        "VIP priority support",
                        "Premium profile recommendations"
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

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelMembership()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Profile not found");

            if (profile.MembershipType == "Free Member" || profile.MembershipType == "Free" || !profile.IsPremium)
            {
                return BadRequest(new { Message = "You are currently on the Free Plan and do not have an active premium membership to cancel." });
            }

            profile.MembershipType = "Free Member";
            profile.IsPremium = false;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Your membership has been successfully cancelled and downgraded to the Free Plan.", Profile = profile });
        }
    }

    public class UpgradeRequest
    {
        public string MembershipType { get; set; } = "Free";
    }
}
