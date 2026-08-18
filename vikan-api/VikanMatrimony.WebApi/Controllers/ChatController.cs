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
