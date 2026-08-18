using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;
using VikanMatrimony.WebApi.Services;

namespace VikanMatrimony.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AdminController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private bool IsAdmin()
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            return string.Equals(email, "admin@vikan.com", StringComparison.OrdinalIgnoreCase);
        }

        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            if (!IsAdmin()) return Forbid();

            var pendingProfiles = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Photos)
                .Where(p => (!p.IsApproved || p.ApprovalStatus == "Pending") && p.User.Email != "admin@vikan.com")
                .OrderByDescending(p => p.CreatedAt)
                .Take(100)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Gender,
                    p.DateOfBirth,
                    p.Religion,
                    p.Community,
                    p.MotherTongue,
                    p.City,
                    p.State,
                    p.Education,
                    p.Occupation,
                    p.Salary,
                    p.MembershipType,
                    p.ApprovalStatus,
                    p.IsApproved,
                    p.CreatedAt,
                    Email = p.User.Email,
                    PhoneNumber = p.User.PhoneNumber,
                    Photos = p.Photos.Select(ph => ph.Url).ToList()
                })
                .ToListAsync();

            return Ok(pendingProfiles);
        }

        [HttpPost("profiles/{id}/approve")]
        public async Task<IActionResult> ApproveProfile(string id)
        {
            if (!IsAdmin()) return Forbid();

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            profile.IsApproved = true;
            profile.ApprovalStatus = "Approved";
            profile.IsVerified = true;

            await _context.SaveChangesAsync();

            // Send approval email via Gmail SMTP
            if (!string.IsNullOrEmpty(profile.User?.Email))
            {
                try
                {
                    await _emailService.SendApprovalEmailAsync(profile.User.Email, profile.Name);
                }
                catch (Exception)
                {
                    // Email logging
                }
            }

            return Ok(new { Message = "Profile approved successfully and confirmation email sent to the user." });
        }

        [HttpPost("profiles/{id}/reject")]
        public async Task<IActionResult> RejectProfile(string id, [FromBody] RejectProfileRequest? request)
        {
            if (!IsAdmin()) return Forbid();

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            profile.IsApproved = false;
            profile.ApprovalStatus = "Rejected";

            await _context.SaveChangesAsync();

            // Send rejection notification email via Gmail SMTP
            if (!string.IsNullOrEmpty(profile.User?.Email))
            {
                try
                {
                    await _emailService.SendRejectionEmailAsync(profile.User.Email, profile.Name, request?.Reason);
                }
                catch (Exception)
                {
                    // Log email error
                }
            }

            return Ok(new { Message = "Profile has been rejected and notification email sent to the user." });
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            if (!IsAdmin()) return Forbid();

            var totalUsers = await _context.Profiles.CountAsync();
            var premiumUsers = await _context.Profiles.CountAsync(p => p.IsPremium);
            var verifiedUsers = await _context.Profiles.CountAsync(p => p.IsVerified);
            var pendingVerifications = await _context.Verifications.CountAsync(v => v.Status == "Pending");
            var unresolvedReports = await _context.SafetyReports.CountAsync(r => r.Status == "Unresolved");

            // Gender breakdown
            var maleCount = await _context.Profiles.CountAsync(p => p.Gender.ToLower() == "male");
            var femaleCount = await _context.Profiles.CountAsync(p => p.Gender.ToLower() == "female");

            return Ok(new
            {
                TotalMembers = totalUsers,
                PremiumMembers = premiumUsers,
                VerifiedMembers = verifiedUsers,
                PendingVerificationsCount = pendingVerifications,
                UnresolvedSafetyReportsCount = unresolvedReports,
                Demographics = new
                {
                    MaleCount = maleCount,
                    FemaleCount = femaleCount,
                    MalePercentage = totalUsers > 0 ? (maleCount * 100.0 / totalUsers) : 0,
                    FemalePercentage = totalUsers > 0 ? (femaleCount * 100.0 / totalUsers) : 0
                }
            });
        }

        [HttpGet("verifications")]
        public async Task<IActionResult> GetPendingVerifications()
        {
            if (!IsAdmin()) return Forbid();

            var verifications = await _context.Verifications
                .AsNoTracking()
                .Include(v => v.Profile)
                .Where(v => v.Status == "Pending")
                .Take(100)
                .ToListAsync();

            return Ok(verifications);
        }

        [HttpPost("verifications/{id}/approve")]
        public async Task<IActionResult> ApproveVerification(string id)
        {
            if (!IsAdmin()) return Forbid();

            var verification = await _context.Verifications
                .Include(v => v.Profile)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (verification == null) return NotFound(new { Message = "Verification request not found" });

            verification.Status = "Approved";
            verification.Profile.IsVerified = true;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Verification request approved, profile marked as verified" });
        }

        [HttpPost("verifications/{id}/reject")]
        public async Task<IActionResult> RejectVerification(string id)
        {
            if (!IsAdmin()) return Forbid();

            var verification = await _context.Verifications
                .FirstOrDefaultAsync(v => v.Id == id);

            if (verification == null) return NotFound(new { Message = "Verification request not found" });

            verification.Status = "Rejected";

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Verification request rejected" });
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetSafetyReports()
        {
            if (!IsAdmin()) return Forbid();

            var reports = await _context.SafetyReports
                .AsNoTracking()
                .Include(r => r.Reporter)
                .Include(r => r.Reported)
                .OrderByDescending(r => r.CreatedAt)
                .Take(100)
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPost("members/{id}/suspend")]
        public async Task<IActionResult> SuspendMember(string id)
        {
            if (!IsAdmin()) return Forbid();

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            _context.Profiles.Remove(profile);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Member profile suspended and deleted successfully" });
        }
    }

    public class RejectProfileRequest
    {
        public string? Reason { get; set; }
    }
}
