using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetCurrentProfileId()
        {
            return User.FindFirst("ProfileId")?.Value ?? string.Empty;
        }

        [HttpGet("connections")]
        public async Task<IActionResult> GetChatConnections()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            // Fetch mutual match profiles (Status = Accepted where profile is sender or receiver)
            var acceptedInterests = await _context.Interests
                .AsNoTracking()
                .Where(i => (i.SenderId == profileId || i.ReceiverId == profileId) && i.Status == "Accepted")
                .ToListAsync();

            var partnerIds = acceptedInterests
                .Select(i => i.SenderId == profileId ? i.ReceiverId : i.SenderId)
                .Distinct()
                .ToList();

            var partners = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.Photos)
                .Where(p => partnerIds.Contains(p.Id))
                .ToListAsync();

            return Ok(partners.Select(partner => new
            {
                partner.Id,
                partner.Name,
                partner.Gender,
                partner.OnlineStatus,
                partner.LastActive,
                Photos = partner.Photos.Select(ph => ph.Url).ToList()
            }));
        }

        [HttpGet("messages/{partnerId}")]
        public async Task<IActionResult> GetMessageHistory(string partnerId)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var messages = await _context.Messages
                .AsNoTracking()
                .Where(m => (m.SenderId == profileId && m.ReceiverId == partnerId) || 
                             (m.SenderId == partnerId && m.ReceiverId == profileId))
                .OrderBy(m => m.Timestamp)
                .Take(200)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("messages/{partnerId}")]
        public async Task<IActionResult> SendMessageLog(string partnerId, [FromBody] ChatMessageRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var sender = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId);
            if (sender == null) return NotFound("Sender profile not found.");

            var membership = sender.MembershipType?.ToLower().Replace(" ", "") ?? "free";

            // 1. Block Free members from chatting
            if (membership == "free" || membership == "freemember")
            {
                return BadRequest(new { Message = "Chatting is not available on the Free package. Please upgrade to Silver, Gold, or Diamond to start messaging." });
            }

            // 2. Limit Silver members to 20 messages per day
            if (membership == "silver" || membership == "silvermember")
            {
                var todayUtc = DateTime.UtcNow.Date;
                var sentTodayCount = await _context.Messages
                    .CountAsync(m => m.SenderId == profileId && m.Timestamp >= todayUtc);

                if (sentTodayCount >= 20)
                {
                    return BadRequest(new { Message = "Silver members have a limit of 20 chat messages per day. Please upgrade to Gold or Diamond for unlimited chatting." });
                }
            }

            var message = new Message
            {
                SenderId = profileId,
                ReceiverId = partnerId,
                Text = request.Text,
                IsRead = false,
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpPost("messages/read/{partnerId}")]
        public async Task<IActionResult> MarkMessagesAsRead(string partnerId)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var unread = await _context.Messages
                .Where(m => m.SenderId == partnerId && m.ReceiverId == profileId && !m.IsRead)
                .ToListAsync();

            if (unread.Any())
            {
                foreach (var msg in unread)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { Count = unread.Count });
        }
    }

    public class ChatMessageRequest
    {
        public string Text { get; set; } = null!;
    }
}
