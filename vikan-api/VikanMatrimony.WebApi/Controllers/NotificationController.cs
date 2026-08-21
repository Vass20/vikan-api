using System;
using System.Linq;
using System.Threading.Tasks;
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
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetCurrentProfileId()
        {
            return User.FindFirst("ProfileId")?.Value ?? string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var notifications = await _context.Notifications
                .Where(n => n.ProfileId == profileId)
                .OrderByDescending(n => n.Timestamp)
                .Take(100) // Keep list reasonable
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.ProfileId == profileId);

            if (notification == null) return NotFound(new { Message = "Notification not found." });

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification marked as read." });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var unreadNotifications = await _context.Notifications
                .Where(n => n.ProfileId == profileId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "All notifications marked as read." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.ProfileId == profileId);

            if (notification == null) return NotFound(new { Message = "Notification not found." });

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification deleted successfully." });
        }
    }
}
