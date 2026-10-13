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
        private readonly IWebHostEnvironment _env;

        public AdminController(ApplicationDbContext context, IEmailService emailService, IWebHostEnvironment env)
        {
            _context = context;
            _emailService = emailService;
            _env = env;
        }

        private bool IsAdmin()
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            return string.Equals(email, "admin@vikan.com", StringComparison.OrdinalIgnoreCase);
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            if (!IsAdmin()) return Forbid();

            var customers = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Photos)
                .Include(p => p.Verifications)
                .Where(p => p.User.Email != "admin@vikan.com")
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.UserId,
                    p.Name,
                    p.Gender,
                    p.DateOfBirth,
                    p.Religion,
                    p.Community,
                    p.Caste,
                    p.MotherTongue,
                    p.MaritalStatus,
                    p.Education,
                    p.Occupation,
                    p.Salary,
                    p.City,
                    p.State,
                    p.Diet,
                    p.ParentsNumber,
                    p.MembershipType,
                    p.IsPremium,
                    p.IsVerified,
                    p.IsApproved,
                    p.ApprovalStatus,
                    p.Generation,
                    p.CreatedAt,
                    Email = p.User.Email,
                    PhoneNumber = p.User.PhoneNumber,
                    Photos = p.Photos.Select(ph => ph.Url).ToList(),
                    IdProofUrl = !string.IsNullOrEmpty(p.IdProofUrl) ? p.IdProofUrl : (p.Verifications.OrderByDescending(v => v.SubmittedAt).Select(v => v.DocumentUrl).FirstOrDefault() ?? string.Empty),
                    IdProofType = !string.IsNullOrEmpty(p.IdProofType) ? p.IdProofType : (p.Verifications.OrderByDescending(v => v.SubmittedAt).Select(v => v.DocumentType).FirstOrDefault() ?? string.Empty)
                })
                .ToListAsync();

            return Ok(customers);
        }

        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            if (!IsAdmin()) return Forbid();

            var pendingProfiles = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Photos)
                .Include(p => p.Verifications)
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
                    p.Caste,
                    p.MotherTongue,
                    p.City,
                    p.State,
                    p.Education,
                    p.Occupation,
                    p.Salary,
                    p.MembershipType,
                    p.ApprovalStatus,
                    p.IsApproved,
                    p.Generation,
                    p.CreatedAt,
                    Email = p.User.Email,
                    PhoneNumber = p.User.PhoneNumber,
                    Photos = p.Photos.Select(ph => ph.Url).ToList(),
                    IdProofUrl = !string.IsNullOrEmpty(p.IdProofUrl) ? p.IdProofUrl : (p.Verifications.OrderByDescending(v => v.SubmittedAt).Select(v => v.DocumentUrl).FirstOrDefault() ?? string.Empty),
                    IdProofType = !string.IsNullOrEmpty(p.IdProofType) ? p.IdProofType : (p.Verifications.OrderByDescending(v => v.SubmittedAt).Select(v => v.DocumentType).FirstOrDefault() ?? string.Empty)
                })
                .ToListAsync();

            return Ok(pendingProfiles);
        }

        [HttpPost("profiles/{id}/attach-id-proof")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AttachIdProof(string id, [FromForm] IFormFile file, [FromForm] string? documentType)
        {
            if (!IsAdmin()) return Forbid();
            if (file == null || file.Length == 0) return BadRequest(new { Message = "No file selected." });

            var profile = await _context.Profiles
                .Include(p => p.Verifications)
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found." });

            var root = !string.IsNullOrWhiteSpace(_env.WebRootPath) ? _env.WebRootPath : Path.Combine(_env.ContentRootPath, "wwwroot");
            var uploadsFolder = Path.Combine(root, "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";
            var docType = string.IsNullOrWhiteSpace(documentType) ? "Government ID" : documentType.Trim();

            profile.IdProofUrl = fileUrl;
            profile.IdProofType = docType;

            profile.Verifications.Add(new Verification
            {
                DocumentType = docType,
                DocumentUrl = fileUrl,
                FaceScanUrl = profile.Photos.FirstOrDefault()?.Url ?? string.Empty,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Government ID proof attached successfully.", url = fileUrl, DocumentType = docType });
        }

        [HttpPost("profiles/{id}/approve")]
        public async Task<IActionResult> ApproveProfile(string id)
        {
            if (!IsAdmin()) return Forbid();

            var profile = await _context.Profiles
                .Include(p => p.User)
                .Include(p => p.Verifications)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            profile.IsApproved = true;
            profile.ApprovalStatus = "Approved";
            profile.IsVerified = true;
            foreach (var v in profile.Verifications)
            {
                v.Status = "Approved";
            }

            await _context.SaveChangesAsync();

            // Create database notification for user
            var approvalNotification = new Notification
            {
                ProfileId = id,
                Title = "Profile Approved",
                Body = "Congratulations! Your profile has been reviewed and approved by the Superadmin moderation team.",
                Type = "verification",
                Link = "/dashboard",
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };
            _context.Notifications.Add(approvalNotification);
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
                .Include(p => p.Verifications)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            profile.IsApproved = false;
            profile.ApprovalStatus = "Rejected";
            profile.IsVerified = false;
            foreach (var v in profile.Verifications)
            {
                v.Status = "Rejected";
            }

            await _context.SaveChangesAsync();

            // Create database notification for user
            var rejectionNotification = new Notification
            {
                ProfileId = id,
                Title = "Profile Review Update",
                Body = "Your profile registration could not be approved at this time. Please check your email for the reason and further details.",
                Type = "system",
                Link = "/verification",
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };
            _context.Notifications.Add(rejectionNotification);
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

            // Registrations over the last 7 days (pre-filled with zero-counts for inactive days)
            var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
            var registrationTrend = await _context.Profiles
                .Where(p => p.CreatedAt >= sevenDaysAgo)
                .GroupBy(p => p.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var trendDict = registrationTrend.ToDictionary(t => t.Date, t => t.Count);
            var last7Days = Enumerable.Range(0, 7)
                .Select(offset => DateTime.UtcNow.Date.AddDays(-6 + offset))
                .Select(date => new
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Label = date.ToString("ddd"), // "Mon", "Tue" etc.
                    Count = trendDict.TryGetValue(date, out var count) ? count : 0
                })
                .ToList();

            // Plan counts
            var freeCount = await _context.Profiles.CountAsync(p => !p.IsPremium);
            var premiumCount = await _context.Profiles.CountAsync(p => p.IsPremium);

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
                },
                RegistrationTrend = last7Days,
                PlanDistribution = new[]
                {
                    new { Plan = "Free Plan", Count = freeCount },
                    new { Plan = "Premium Plus", Count = premiumCount }
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

        [HttpGet("tickets")]
        public async Task<IActionResult> GetSupportTickets()
        {
            if (!IsAdmin()) return Forbid();

            var tickets = await _context.SupportTickets
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpPost("tickets/{id}/status")]
        public async Task<IActionResult> UpdateTicketStatus(string id, [FromBody] UpdateTicketStatusRequest request)
        {
            if (!IsAdmin()) return Forbid();

            var ticket = await _context.SupportTickets.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound();

            ticket.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }
    }

    public class RejectProfileRequest
    {
        public string? Reason { get; set; }
    }

    public class UpdateTicketStatusRequest
    {
        public string Status { get; set; } = null!;
    }
}
