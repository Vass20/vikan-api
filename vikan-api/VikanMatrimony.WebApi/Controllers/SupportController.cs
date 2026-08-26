using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SupportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("ticket")]
        public async Task<IActionResult> CreateSupportTicket([FromBody] CreateSupportTicketRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { Message = "All fields (Name, Email, Subject, Message) are required." });
            }

            // Extract optional authenticated ProfileId
            string? profileId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                profileId = User.FindFirst("ProfileId")?.Value;
            }

            // Generate Ticket Number
            var randomNum = new Random().Next(100000, 999999);
            var ticketNumber = $"VIK-TKT-{randomNum}";

            var ticket = new SupportTicket
            {
                Id = Guid.NewGuid().ToString(),
                ProfileId = profileId,
                Name = request.Name.Trim(),
                Email = request.Email.Trim(),
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                TicketNumber = ticketNumber,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                ticketNumber = ticketNumber,
                message = "Your support request has been recorded. Our concierge support will email you shortly."
            });
        }
    }

    public class CreateSupportTicketRequest
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string Message { get; set; } = null!;
    }
}
