using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;
using VikanMatrimony.WebApi.Services;

namespace VikanMatrimony.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InterestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public InterestController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private string GetCurrentProfileId()
        {
            return User.FindFirst("ProfileId")?.Value ?? string.Empty;
        }

        [HttpPost("send/{receiverId}")]
        public async Task<IActionResult> SendInterest(string receiverId)
        {
            var senderId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(senderId)) return Unauthorized();

            if (senderId == receiverId) return BadRequest(new { Message = "You cannot send interest to yourself" });

            // Check if receiver exists
            var receiver = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == receiverId);
            if (receiver == null) return NotFound(new { Message = "Recipient profile not found" });

            var sender = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == senderId);
            if (sender == null) return NotFound(new { Message = "Sender profile not found" });

            // Check if already sent
            var existing = await _context.Interests
                .FirstOrDefaultAsync(i => i.SenderId == senderId && i.ReceiverId == receiverId);

            if (existing != null)
            {
                if (existing.Status == "Declined")
                {
                    // Allow re-sending if previously declined
                    existing.Status = "Pending";
                    existing.SentAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Create database notification for receiver on re-sent
                    var resentNotification = new Notification
                    {
                        ProfileId = receiverId,
                        Title = "New Interest Request",
                        Body = $"{sender.Name} has expressed interest in your profile.",
                        Type = "interest",
                        Link = $"/profile/{senderId}",
                        IsRead = false,
                        Timestamp = DateTime.UtcNow
                    };
                    _context.Notifications.Add(resentNotification);
                    await _context.SaveChangesAsync();

                    if (!string.IsNullOrEmpty(receiver.User?.Email))
                    {
                        try { await _emailService.SendInterestReceivedEmailAsync(receiver.User.Email, receiver.Name, sender.Name); } catch {}
                    }

                    return Ok(new { Message = "Interest request re-sent successfully", Interest = existing });
                }
                return BadRequest(new { Message = $"Interest already sent. Status: {existing.Status}" });
            }

            var interest = new Interest
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = "Pending",
                SentAt = DateTime.UtcNow
            };

            _context.Interests.Add(interest);
            await _context.SaveChangesAsync();

            // Create database notification for receiver
            var newNotification = new Notification
            {
                ProfileId = receiverId,
                Title = "New Interest Request",
                Body = $"{sender.Name} has expressed interest in your profile.",
                Type = "interest",
                Link = $"/profile/{senderId}",
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };
            _context.Notifications.Add(newNotification);
            await _context.SaveChangesAsync();

            // Send notification email to the receiver
            if (!string.IsNullOrEmpty(receiver.User?.Email))
            {
                try
                {
                    await _emailService.SendInterestReceivedEmailAsync(receiver.User.Email, receiver.Name, sender.Name);
                }
                catch
                {
                    // Email delivery logged in service
                }
            }

            return Ok(new { Message = "Interest expressed successfully", Interest = interest });
        }

        [HttpPost("accept/{senderId}")]
        public async Task<IActionResult> AcceptInterest(string senderId)
        {
            var receiverId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(receiverId)) return Unauthorized();

            var interest = await _context.Interests
                .Include(i => i.Sender)
                    .ThenInclude(s => s.User)
                .Include(i => i.Receiver)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(i => i.SenderId == senderId && i.ReceiverId == receiverId && i.Status == "Pending");

            if (interest == null) return NotFound(new { Message = "Pending interest request not found" });

            interest.Status = "Accepted";
            interest.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Create database notification for sender
            var acceptNotification = new Notification
            {
                ProfileId = senderId,
                Title = "Interest Accepted",
                Body = $"{interest.Receiver.Name} accepted your interest request!",
                Type = "interest",
                Link = $"/profile/{receiverId}",
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };
            _context.Notifications.Add(acceptNotification);
            await _context.SaveChangesAsync();

            // Send acceptance notification email to the sender
            if (!string.IsNullOrEmpty(interest.Sender?.User?.Email))
            {
                try
                {
                    await _emailService.SendInterestAcceptedEmailAsync(
                        interest.Sender.User.Email,
                        interest.Sender.Name,
                        interest.Receiver.Name
                    );
                }
                catch
                {
                    // Logged in email service
                }
            }

            return Ok(new { Message = "Interest accepted successfully! You can now chat directly.", Interest = interest });
        }

        [HttpPost("decline/{senderId}")]
        public async Task<IActionResult> DeclineInterest(string senderId)
        {
            var receiverId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(receiverId)) return Unauthorized();

            var interest = await _context.Interests
                .FirstOrDefaultAsync(i => i.SenderId == senderId && i.ReceiverId == receiverId && i.Status == "Pending");

            if (interest == null) return NotFound(new { Message = "Pending interest request not found" });

            interest.Status = "Declined";
            interest.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Interest request declined.", Interest = interest });
        }

        [HttpGet("received")]
        public async Task<IActionResult> GetReceivedInterests()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var received = await _context.Interests
                .AsNoTracking()
                .Include(i => i.Sender)
                    .ThenInclude(s => s.Photos)
                .Where(i => i.ReceiverId == profileId)
                .OrderByDescending(i => i.SentAt)
                .Take(100)
                .ToListAsync();

            return Ok(received.Select(i => new
            {
                i.Id,
                i.Status,
                i.SentAt,
                i.RespondedAt,
                Sender = new
                {
                    i.Sender.Id,
                    i.Sender.Name,
                    i.Sender.Gender,
                    i.Sender.DateOfBirth,
                    i.Sender.Religion,
                    i.Sender.Community,
                    i.Sender.Education,
                    i.Sender.Occupation,
                    i.Sender.Salary,
                    i.Sender.City,
                    i.Sender.State,
                    i.Sender.IsVerified,
                    i.Sender.IsPremium,
                    Photos = i.Sender.Photos.Select(p => p.Url).ToList()
                }
            }));
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSentInterests()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var sent = await _context.Interests
                .AsNoTracking()
                .Include(i => i.Receiver)
                    .ThenInclude(r => r.Photos)
                .Where(i => i.SenderId == profileId)
                .OrderByDescending(i => i.SentAt)
                .Take(100)
                .ToListAsync();

            return Ok(sent.Select(i => new
            {
                i.Id,
                i.Status,
                i.SentAt,
                i.RespondedAt,
                Receiver = new
                {
                    i.Receiver.Id,
                    i.Receiver.Name,
                    i.Receiver.Gender,
                    i.Receiver.DateOfBirth,
                    i.Receiver.Religion,
                    i.Receiver.Community,
                    i.Receiver.Education,
                    i.Receiver.Occupation,
                    i.Receiver.Salary,
                    i.Receiver.City,
                    i.Receiver.State,
                    i.Receiver.IsVerified,
                    i.Receiver.IsPremium,
                    Photos = i.Receiver.Photos.Select(p => p.Url).ToList()
                }
            }));
        }
    }
}
