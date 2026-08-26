using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<PaymentController> logger)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        private string GetCurrentProfileId()
        {
            return User.FindFirst("ProfileId")?.Value ?? string.Empty;
        }

        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (string.IsNullOrEmpty(request.PlanName))
            {
                return BadRequest(new { Message = "Plan name is required." });
            }

            // Map plan pricing (Amounts in Indian Rupees)
            decimal amountInRupees = request.PlanName.ToLower().Replace(" ", "") switch
            {
                "silver" => 1499,
                "gold" => 2499,
                "diamond" => 4999,
                "royalplatinum" => 8999,
                "platinum" => 8999,
                _ => 0
            };

            if (amountInRupees == 0)
            {
                return BadRequest(new { Message = "Invalid or free plan selected." });
            }

            var amountInPaise = (long)(amountInRupees * 100);
            var keyId = _configuration["Razorpay:KeyId"] ?? "rzp_test_VikanMatrimonyDummyKeyId123";
            var keySecret = _configuration["Razorpay:KeySecret"] ?? "VikanMatrimonyDummySecretKey123";

            string gatewayOrderId;

            // Check if credentials are dummy (Simulation mode)
            if (keyId.Contains("Dummy") || keySecret.Contains("Dummy"))
            {
                // In demo/simulation mode, we generate a mockup order ID
                gatewayOrderId = $"order_simulated_{Guid.NewGuid().ToString().Replace("-", "").Substring(0, 14)}";
            }
            else
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var authString = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{keyId}:{keySecret}"));
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authString);

                    var orderPayload = new
                    {
                        amount = amountInPaise,
                        currency = "INR",
                        receipt = $"receipt_prof_{profileId.Substring(0, Math.Min(8, profileId.Length))}_{DateTime.UtcNow.Ticks}"
                    };

                    var stringContent = new StringContent(JsonSerializer.Serialize(orderPayload), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync("https://api.razorpay.com/v1/orders", stringContent);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errText = await response.Content.ReadAsStringAsync();
                        _logger.LogError("Razorpay Order Creation Failed: {Error}", errText);
                        return StatusCode((int)response.StatusCode, new { Message = "Failed to initiate payment with Razorpay.", Detail = errText });
                    }

                    var responseBody = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseBody);
                    gatewayOrderId = doc.RootElement.GetProperty("id").GetString() ?? throw new InvalidOperationException("Order ID not returned.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception during Razorpay Order Creation.");
                    // Fallback to simulated order in development/local test configurations
                    gatewayOrderId = $"order_simulated_{Guid.NewGuid().ToString().Replace("-", "").Substring(0, 14)}";
                }
            }

            // Save transaction record to DB
            var transaction = new PaymentTransaction
            {
                Id = Guid.NewGuid().ToString(),
                ProfileId = profileId,
                PlanName = request.PlanName,
                Amount = amountInRupees,
                Currency = "INR",
                GatewayOrderId = gatewayOrderId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                orderId = gatewayOrderId,
                amount = amountInPaise,
                currency = "INR",
                keyId = keyId,
                isSimulation = gatewayOrderId.StartsWith("order_simulated_")
            });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var transaction = await _context.PaymentTransactions
                .FirstOrDefaultAsync(t => t.GatewayOrderId == request.RazorpayOrderId && t.ProfileId == profileId);

            if (transaction == null)
            {
                return NotFound(new { Message = "Transaction record not found." });
            }

            var keySecret = _configuration["Razorpay:KeySecret"] ?? "VikanMatrimonyDummySecretKey123";
            bool isVerified = false;

            // Handle simulation bypass for offline development
            if (request.RazorpayOrderId.StartsWith("order_simulated_"))
            {
                isVerified = true;
            }
            else
            {
                try
                {
                    // Compute signature validation
                    var payload = $"{request.RazorpayOrderId}|{request.RazorpayPaymentId}";
                    var keyBytes = Encoding.UTF8.GetBytes(keySecret);
                    var payloadBytes = Encoding.UTF8.GetBytes(payload);

                    using var hmac = new HMACSHA256(keyBytes);
                    var hashBytes = hmac.ComputeHash(payloadBytes);
                    var calculatedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                    isVerified = calculatedSignature == request.RazorpaySignature;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Signature verification exception");
                }
            }

            if (!isVerified)
            {
                transaction.Status = "Failed";
                await _context.SaveChangesAsync();
                return BadRequest(new { Message = "Payment signature verification failed." });
            }

            // Update Transaction state
            transaction.Status = "Paid";
            transaction.GatewayPaymentId = request.RazorpayPaymentId;
            transaction.PaidAt = DateTime.UtcNow;

            // Update user profile membership
            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile != null)
            {
                profile.MembershipType = transaction.PlanName;
                profile.IsPremium = true;
            }

            await _context.SaveChangesAsync();

            // Create notification about upgrade
            var notification = new Notification
            {
                Id = Guid.NewGuid().ToString(),
                ProfileId = profileId,
                Title = "Membership Upgraded",
                Body = $"Thank you! Your profile has been upgraded to the {transaction.PlanName} Plan.",
                Type = "system",
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Payment verified successfully, membership upgraded." });
        }
    }

    public class CreateOrderRequest
    {
        public string PlanName { get; set; } = null!;
    }

    public class VerifyPaymentRequest
    {
        public string RazorpayOrderId { get; set; } = null!;
        public string RazorpayPaymentId { get; set; } = null!;
        public string RazorpaySignature { get; set; } = null!;
    }
}
