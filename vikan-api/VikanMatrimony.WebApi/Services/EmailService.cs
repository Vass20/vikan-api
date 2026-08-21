using System;
using System.Net;
using System.Net.Mail;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace VikanMatrimony.WebApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private static readonly HttpClient _httpClient = new HttpClient();

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private async Task<bool> TrySendViaRestApiAsync(string toEmail, string subject, string htmlBody, string senderName, string senderEmail)
        {
            var brevoApiKey = _configuration["Brevo:ApiKey"];
            var resendApiKey = _configuration["Resend:ApiKey"];

            if (!string.IsNullOrEmpty(brevoApiKey))
            {
                try
                {
                    _logger.LogInformation("Attempting to send email to {Email} via Brevo REST API...", toEmail);
                    using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                    request.Headers.Add("api-key", brevoApiKey);
                    request.Content = JsonContent.Create(new
                    {
                        sender = new { name = senderName, email = senderEmail },
                        to = new[] { new { email = toEmail } },
                        subject = subject,
                        htmlContent = htmlBody
                    });
                    
                    var response = await _httpClient.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Email sent successfully via Brevo REST API.");
                        return true;
                    }
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Brevo API returned error: {Error}", error);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email via Brevo API.");
                }
            }
            else if (!string.IsNullOrEmpty(resendApiKey))
            {
                try
                {
                    _logger.LogInformation("Attempting to send email to {Email} via Resend REST API...", toEmail);
                    using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", resendApiKey);
                    request.Content = JsonContent.Create(new
                    {
                        from = $"{senderName} <onboarding@resend.dev>", // Or verified domain email
                        to = new[] { toEmail },
                        subject = subject,
                        html = htmlBody
                    });

                    var response = await _httpClient.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Email sent successfully via Resend REST API.");
                        return true;
                    }
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Resend API returned error: {Error}", error);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send email via Resend API.");
                }
            }

            return false;
        }

        private async Task SendEmailCoreAsync(string toEmail, string subject, string htmlBody, string senderName, string senderEmail, string host, int port, string appPassword, bool enableSsl)
        {
            // 1. Try sending via REST API first (if Brevo or Resend keys are set)
            if (await TrySendViaRestApiAsync(toEmail, subject, htmlBody, senderName, senderEmail))
            {
                return;
            }

            // 2. Fall back to standard SMTP if REST API is not configured
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(senderEmail, appPassword),
                EnableSsl = enableSsl
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "playstoreavanikotechnologies@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "ckpcbdqosvjlawmg";
            var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            var subject = $"{otp} is your Vikan Matrimony Verification Code";
            
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 32px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; margin-bottom: 24px; }}
        .otp-box {{ background: rgba(197, 168, 128, 0.1); border: 2px dashed #C5A880; border-radius: 12px; padding: 18px; margin: 24px 0; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #FFFFFF; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <h2 style='color: #FFFFFF; margin-top: 0;'>Email Verification</h2>
        <p class='subtitle'>Thank you for starting your journey with Vikan Matrimony. Use the verification code below to verify your email address.</p>
        
        <div class='otp-box'>{otp}</div>
        
        <p style='font-size: 13px; color: #CBD5E1;'>This code is valid for <strong>10 minutes</strong>. If you did not request this, please disregard this email.</p>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword, enableSsl);
                _logger.LogInformation("OTP email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendApprovalEmailAsync(string toEmail, string userName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "playstoreavanikotechnologies@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "ckpcbdqosvjlawmg";
            var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            var subject = "🎉 Congratulations! Your Vikan Matrimony Profile Has Been Approved";
            
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #D4A94A 0%, #C5A880 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; margin: 10px 0 24px 0; text-transform: uppercase; letter-spacing: 1px; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>✓ Profile Approved &amp; Verified</div>
        <div class='title'>Welcome, {userName}!</div>
        <p class='subtitle'>
            We are pleased to inform you that your profile has been successfully verified and approved by the Superadmin moderation team.
            <br><br>
            You can now log in to your account, browse curated matches, send interests, and begin your journey to finding your ideal life partner.
        </p>
        
        <a href='http://localhost:3000/login' class='btn'>Log In To Your Account</a>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword, enableSsl);
                _logger.LogInformation("Approval email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send approval email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendRejectionEmailAsync(string toEmail, string userName, string? reason)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "playstoreavanikotechnologies@gmail.com";
            var senderName = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "ckpcbdqosvjlawmg";
            var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            var subject = "Update Regarding Your Vikan Matrimony Registration";
            var reasonText = !string.IsNullOrWhiteSpace(reason) 
                ? reason.Trim() 
                : "Your profile details or uploaded photos did not meet our verification and community safety standards.";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #F87171; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 20px; }}
        .reason-box {{ background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin: 16px 0 24px 0; text-align: left; }}
        .reason-title {{ font-size: 11px; font-weight: bold; text-transform: uppercase; color: #F87171; letter-spacing: 1px; margin-bottom: 6px; }}
        .reason-content {{ font-size: 13px; color: #E2E8F0; line-height: 1.5; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>Registration Review Notice</div>
        <div class='title'>Hello, {userName}</div>
        <p class='subtitle'>
            Thank you for your interest in joining Vikan Matrimony. After careful review by our Superadmin moderation team, your profile registration has not been approved at this time.
        </p>
        
        <div class='reason-box'>
            <div class='reason-title'>Reason for decision:</div>
            <div class='reason-content'>{reasonText}</div>
        </div>

        <p class='subtitle' style='font-size: 13px;'>
            If you believe this was in error, or if you would like to provide updated documentation and accurate details, please contact our support team at <strong style='color: #C5A880;'>support@vikan.com</strong>.
        </p>
        
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderName, senderEmail, host, port, appPassword, enableSsl);
                _logger.LogInformation("Rejection email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send rejection email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendInterestReceivedEmailAsync(string toEmail, string receiverName, string senderName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "playstoreavanikotechnologies@gmail.com";
            var senderNameConfig = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "ckpcbdqosvjlawmg";
            var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            var subject = $"💌 New Interest Request from {senderName} on Vikan Matrimony";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(197, 168, 128, 0.15); border: 1px solid #C5A880; color: #C5A880; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #E5DCD0 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>New Match Interest</div>
        <div class='title'>Hello, {receiverName}</div>
        <p class='subtitle'>
            <strong style='color: #C5A880;'>{senderName}</strong> has viewed your profile and expressed interest to connect with you on Vikan Matrimony.
        </p>
        <div>
            <a href='http://localhost:3000/dashboard' class='button'>View & Respond to Request</a>
        </div>
        <p class='subtitle' style='font-size: 12px; margin-top: 16px;'>
            Log in to your dashboard to review their complete horoscope, family background, and accept or decline the request.
        </p>
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderNameConfig, senderEmail, host, port, appPassword, enableSsl);
                _logger.LogInformation("Interest received email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send interest received email to {Email}", toEmail);
            }
        }

        public async Task SendInterestAcceptedEmailAsync(string toEmail, string senderName, string receiverName)
        {
            var host = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var senderEmail = _configuration["Smtp:SenderEmail"] ?? "playstoreavanikotechnologies@gmail.com";
            var senderNameConfig = _configuration["Smtp:SenderName"] ?? "Vikan Matrimony";
            var appPassword = _configuration["Smtp:AppPassword"] ?? "ckpcbdqosvjlawmg";
            var enableSsl = bool.TryParse(_configuration["Smtp:EnableSsl"], out var ssl) ? ssl : true;

            var subject = $"🎉 {receiverName} Accepted Your Interest on Vikan Matrimony!";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020914; color: #E5DCD0; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #0B1A2F; border: 1px solid #C5A880; border-radius: 16px; padding: 36px; text-align: center; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #C5A880; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }}
        .badge {{ display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 14px; margin-bottom: 20px; border-radius: 20px; }}
        .title {{ font-size: 22px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }}
        .subtitle {{ font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }}
        .button {{ display: inline-block; background: linear-gradient(135deg, #C5A880 0%, #E5DCD0 100%); color: #020914; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0; }}
        .footer {{ font-size: 12px; color: #64748B; margin-top: 24px; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='logo'>✨ VIKAN MATRIMONY ✨</div>
        <div class='badge'>Connection Accepted</div>
        <div class='title'>Congratulations, {senderName}!</div>
        <p class='subtitle'>
            <strong style='color: #34D399;'>{receiverName}</strong> has accepted your interest request! You are now mutually connected and can start chatting directly.
        </p>
        <div>
            <a href='http://localhost:3000/chat' class='button'>Start Chatting Now</a>
        </div>
        <p class='subtitle' style='font-size: 12px; margin-top: 16px;'>
            We wish you the very best in taking the next steps in your matrimonial journey.
        </p>
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} Vikan Matrimony. Endless Bond. Perfect Match.<br>
            All rights reserved.
        </div>
    </div>
</body>
</html>";

            try
            {
                await SendEmailCoreAsync(toEmail, subject, htmlBody, senderNameConfig, senderEmail, host, port, appPassword, enableSsl);
                _logger.LogInformation("Interest accepted email successfully sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send interest accepted email to {Email}", toEmail);
            }
        }
    }
}
