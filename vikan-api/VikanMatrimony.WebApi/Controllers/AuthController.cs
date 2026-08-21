using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VikanMatrimony.WebApi.Models;
using VikanMatrimony.WebApi.Services;

namespace VikanMatrimony.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly Data.ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            Data.ApplicationDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { Message = "Email address is required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            // Check if email is already registered
            var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "An account with this email already exists. Please log in instead." });
            }

            // Generate random 6-digit OTP
            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            // Remove previous unverified OTPs for this email
            var existingOtps = _context.EmailOtps.Where(o => o.Email == normalizedEmail && !o.IsVerified);
            _context.EmailOtps.RemoveRange(existingOtps);

            var emailOtp = new EmailOtp
            {
                Email = normalizedEmail,
                Otp = otp,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.EmailOtps.Add(emailOtp);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(normalizedEmail, otp);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    Message = "Failed to send verification email. Please check your email configuration.",
                    Details = ex.Message,
                    InnerException = ex.InnerException?.Message
                });
            }

            return Ok(new { Message = "Verification OTP has been sent to your email.", ExpiresInMinutes = 10 });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
            {
                return BadRequest(new { Message = "Email and OTP are required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var otpCode = request.Otp.Trim();

            var record = await _context.EmailOtps
                .Where(o => o.Email == normalizedEmail && o.Otp == otpCode && !o.IsVerified)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (record == null)
            {
                return BadRequest(new { Message = "Invalid verification code. Please check and try again." });
            }

            if (record.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { Message = "Verification code has expired. Please request a new one." });
            }

            record.IsVerified = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Email verified successfully." });
        }

        [HttpPost("forgot-password/send-otp")]
        public async Task<IActionResult> ForgotPasswordSendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { Message = "Email address is required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _userManager.FindByEmailAsync(normalizedEmail);
            if (user == null)
            {
                return BadRequest(new { Message = "No account found with this email address." });
            }

            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            var existingOtps = _context.EmailOtps.Where(o => o.Email == normalizedEmail && !o.IsVerified);
            _context.EmailOtps.RemoveRange(existingOtps);

            var emailOtp = new EmailOtp
            {
                Email = normalizedEmail,
                Otp = otp,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.EmailOtps.Add(emailOtp);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendOtpEmailAsync(normalizedEmail, otp);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    Message = "Failed to send reset code. Please try again.",
                    Details = ex.Message,
                    InnerException = ex.InnerException?.Message
                });
            }

            return Ok(new { Message = "Password reset code sent to your email.", ExpiresInMinutes = 10 });
        }

        [HttpPost("forgot-password/reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { Message = "Email, OTP, and new password are required." });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var otpCode = request.Otp.Trim();

            var user = await _userManager.FindByEmailAsync(normalizedEmail);
            if (user == null)
            {
                return BadRequest(new { Message = "User account not found." });
            }

            var record = await _context.EmailOtps
                .Where(o => o.Email == normalizedEmail && o.Otp == otpCode && !o.IsVerified)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (record == null)
            {
                return BadRequest(new { Message = "Invalid verification code. Please check and try again." });
            }

            if (record.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { Message = "Verification code has expired. Please request a new one." });
            }

            // Generate reset token and reset password using Identity
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            record.IsVerified = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password reset successful. You can now log in with your new password." });
        }

        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadRegistrationPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"http://localhost:5176/uploads/{fileName}";
            return Ok(new { Url = fileUrl });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
 
            var user = new User { UserName = request.Email, Email = request.Email, PhoneNumber = request.PhoneNumber, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(user, request.Password);
 
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
 
            var profile = new Profile
            {
                UserId = user.Id,
                Name = request.Name,
                Gender = request.Gender,
                DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth, DateTimeKind.Utc),
                Religion = request.Religion,
                Community = request.Community,
                MotherTongue = request.MotherTongue,
                MaritalStatus = request.MaritalStatus,
                City = request.City,
                State = request.State,
                Diet = request.Diet,
                Education = request.Education,
                Occupation = request.Occupation,
                Salary = request.Salary,
                FamilyType = request.FamilyType,
                FamilyStatus = request.FamilyStatus,
                FamilyValues = request.FamilyValues,
                FamilyDetails = request.FamilyDetails,
                IsApproved = false,
                ApprovalStatus = "Pending",
                IsVerified = false,
                PartnerPreferences = new PartnerPreferences
                {
                    AgeMin = request.PartnerAgeMin,
                    AgeMax = request.PartnerAgeMax,
                    Religions = new List<string> { request.Religion },
                    Communities = new List<string> { request.Community }
                }
            };

            if (!string.IsNullOrWhiteSpace(request.PhotoUrl))
            {
                profile.Photos.Add(new ProfilePhoto
                {
                    Url = request.PhotoUrl,
                    IsPrimary = true
                });
            }
 
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();
 
            return Ok(new { Message = "Registration successful. Your account is submitted for Superadmin approval." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
 
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null) return Unauthorized(new { Message = "Invalid credentials" });
 
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded) return Unauthorized(new { Message = "Invalid credentials" });
 
            // Fetch profile
            var profile = _context.Profiles.FirstOrDefault(p => p.UserId == user.Id);
            var profileId = profile?.Id ?? string.Empty;

            // Check Superadmin approval (admin user is always exempt)
            if (user.Email?.ToLowerInvariant() != "admin@vikan.com")
            {
                if (profile != null && (!profile.IsApproved || profile.ApprovalStatus == "Pending"))
                {
                    return BadRequest(new { Message = "Your profile is pending verification and approval by the Superadmin. You will receive an email once approved." });
                }
                if (profile != null && profile.ApprovalStatus == "Rejected")
                {
                    return BadRequest(new { Message = "Your profile was reviewed and not approved by the Superadmin. Please contact support." });
                }
            }
 
            var token = GenerateJwtToken(user, profileId);

            return Ok(new {
                Token = token,
                User = new {
                    user.Id,
                    user.Email,
                    ProfileId = profileId,
                    Name = profile?.Name ?? "User"
                }
            });
        }
 
        private string GenerateJwtToken(User user, string profileId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("ProfileId", profileId),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Sub, profileId) // Matches context identifier in hubs
            };
 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default_key_32_bytes_long_minimum"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddDays(7);
 
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );
 
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
 
    public class SendOtpRequest
    {
        public string Email { get; set; } = null!;
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = null!;
        public string Otp { get; set; } = null!;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = null!;
        public string Otp { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Religion { get; set; } = null!;
        public string Community { get; set; } = null!;
        public string MotherTongue { get; set; } = null!;
        public string MaritalStatus { get; set; } = "Never Married";
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string Diet { get; set; } = "Vegetarian";
        public string PhoneNumber { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string FamilyType { get; set; } = "Nuclear";
        public string FamilyStatus { get; set; } = "Middle Class";
        public string FamilyValues { get; set; } = "Moderate";
        public string FamilyDetails { get; set; } = string.Empty;
        public int PartnerAgeMin { get; set; } = 21;
        public int PartnerAgeMax { get; set; } = 35;
        public string PhotoUrl { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
