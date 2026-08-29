using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Models;

namespace VikanMatrimony.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetCurrentProfileId()
        {
            return User.FindFirst("ProfileId")?.Value ?? string.Empty;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyProfile()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var profile = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.Photos)
                .Include(p => p.PartnerPreferences)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == profileId);

            if (profile == null) return NotFound(new { Message = "Profile not found" });

            if (profile.Photos != null)
            {
                profile.Photos = profile.Photos.OrderByDescending(ph => ph.IsPrimary).ThenBy(ph => ph.CreatedAt).ToList();
            }

            return Ok(profile);
        }

        [HttpPut("my")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { Message = "Name is required." });
            }

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            profile.Name = request.Name.Trim();
            profile.Education = request.Education?.Trim() ?? string.Empty;
            profile.Occupation = request.Occupation?.Trim() ?? string.Empty;
            profile.Salary = request.Salary?.Trim() ?? string.Empty;
            profile.State = request.State?.Trim() ?? string.Empty;
            profile.City = request.City?.Trim() ?? string.Empty;
            profile.Diet = request.Diet?.Trim() ?? string.Empty;
            profile.Smoking = request.Smoking?.Trim() ?? string.Empty;
            profile.Drinking = request.Drinking?.Trim() ?? string.Empty;
            profile.ParentsNumber = request.ParentsNumber?.Trim() ?? string.Empty;
            profile.FamilyType = request.FamilyType?.Trim() ?? string.Empty;
            profile.FamilyStatus = request.FamilyStatus?.Trim() ?? string.Empty;
            profile.FamilyValues = request.FamilyValues?.Trim() ?? string.Empty;
            profile.FamilyDetails = request.FamilyDetails?.Trim() ?? string.Empty;
            profile.AboutMe = request.AboutMe?.Trim() ?? string.Empty;
            profile.MaritalStatus = request.MaritalStatus?.Trim() ?? string.Empty;
            profile.MotherTongue = request.MotherTongue?.Trim() ?? string.Empty;
            profile.Religion = request.Religion?.Trim() ?? string.Empty;
            profile.Community = request.Community?.Trim() ?? string.Empty;

            if (request.DateOfBirth.HasValue)
            {
                profile.DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);
            }

            await _context.SaveChangesAsync();
            return Ok(profile);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfileById(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return BadRequest();

            var profile = await _context.Profiles
                .AsNoTracking()
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (profile == null) return NotFound();

            // Strip sensitive identity details for public views
            return Ok(new
            {
                profile.Id,
                profile.Name,
                profile.Gender,
                profile.DateOfBirth,
                profile.Religion,
                profile.Community,
                profile.MotherTongue,
                profile.MaritalStatus,
                profile.Education,
                profile.Occupation,
                profile.Salary,
                profile.State,
                profile.City,
                profile.Diet,
                profile.FamilyType,
                profile.FamilyStatus,
                profile.FamilyValues,
                profile.FamilyDetails,
                profile.AboutMe,
                profile.IsVerified,
                profile.IsPremium,
                profile.MembershipType,
                profile.OnlineStatus,
                profile.LastActive,
                Photos = profile.Photos.OrderByDescending(ph => ph.IsPrimary).ThenBy(ph => ph.CreatedAt).Select(ph => ph.Url).ToList()
            });
        }

        [HttpPost("my/photos")]
        public async Task<IActionResult> UploadPhoto([FromBody] PhotoUploadRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Url))
            {
                return BadRequest(new { Message = "Valid photo URL is required." });
            }

            var profile = await _context.Profiles.Include(p => p.Photos).FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            var photo = new ProfilePhoto
            {
                ProfileId = profileId,
                Url = request.Url.Trim(),
                IsPrimary = !profile.Photos.Any(p => p.IsPrimary)
            };

            _context.ProfilePhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(photo);
        }

        [HttpPost("my/photos/upload")]
        public async Task<IActionResult> UploadPhotoFile(IFormFile file)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var profile = await _context.Profiles.Include(p => p.Photos).FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            if (file == null || file.Length == 0) return BadRequest(new { Message = "No file uploaded." });

            // File size validation (Max 5 MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { Message = "File size exceeds the 5MB limit." });
            }

            // File extension whitelist
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { Message = "Invalid file type. Only JPEG, PNG, and WebP images are allowed." });
            }

            // MIME type validation
            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return BadRequest(new { Message = "Invalid image content type." });
            }

            // Ensure wwwroot/uploads directory exists
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Create cryptographically safe unique filename
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";

            var photo = new ProfilePhoto
            {
                ProfileId = profileId,
                Url = fileUrl,
                IsPrimary = !profile.Photos.Any(p => p.IsPrimary)
            };

            _context.ProfilePhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(photo);
        }

        [HttpPost("my/photos/delete")]
        public async Task<IActionResult> DeletePhoto([FromBody] DeletePhotoRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Url))
            {
                return BadRequest(new { Message = "Photo URL is required." });
            }

            var profile = await _context.Profiles.Include(p => p.Photos).FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            var targetUrl = request.Url.Trim();
            var targetFileName = targetUrl.Contains("/uploads/") 
                ? targetUrl.Substring(targetUrl.IndexOf("/uploads/") + 9) 
                : targetUrl;

            var photo = profile.Photos.FirstOrDefault(p => 
                p.Url == targetUrl || 
                p.Url.EndsWith($"/{targetFileName}") ||
                p.Url.EndsWith($"_simulated_{targetFileName}"));

            if (photo == null)
            {
                return NotFound(new { Message = "Photo not found in your profile." });
            }

            _context.ProfilePhotos.Remove(photo);

            if (photo.IsPrimary && profile.Photos.Count > 1)
            {
                var nextPhoto = profile.Photos.FirstOrDefault(p => p.Id != photo.Id);
                if (nextPhoto != null)
                {
                    nextPhoto.IsPrimary = true;
                }
            }

            await _context.SaveChangesAsync();

            if (targetUrl.Contains("/uploads/"))
            {
                try
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    var fileName = targetFileName.Split('?')[0];
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting physical photo file: {ex.Message}");
                }
            }

            return Ok(new { Message = "Photo deleted successfully", Photos = profile.Photos.OrderByDescending(p => p.IsPrimary).ThenBy(p => p.CreatedAt).Select(p => p.Url).ToList() });
        }

        [HttpPost("my/photos/set-primary")]
        public async Task<IActionResult> SetPrimaryPhoto([FromBody] SetPrimaryPhotoRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Url))
            {
                return BadRequest(new { Message = "Photo URL is required." });
            }

            var profile = await _context.Profiles.Include(p => p.Photos).FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            var targetUrl = request.Url.Trim();
            var targetFileName = targetUrl.Contains("/uploads/") 
                ? targetUrl.Substring(targetUrl.IndexOf("/uploads/") + 9) 
                : targetUrl;

            var targetPhoto = profile.Photos.FirstOrDefault(p => 
                p.Url == targetUrl || 
                p.Url.EndsWith($"/{targetFileName}") ||
                p.Url.EndsWith($"_simulated_{targetFileName}"));

            if (targetPhoto == null)
            {
                return NotFound(new { Message = "Photo not found in your profile." });
            }

            foreach (var photo in profile.Photos)
            {
                photo.IsPrimary = false;
            }

            targetPhoto.IsPrimary = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Primary profile photo updated successfully", Photos = profile.Photos.OrderByDescending(p => p.IsPrimary).ThenBy(p => p.CreatedAt).Select(p => p.Url).ToList() });
        }

        [HttpPost("my/boost")]
        public async Task<IActionResult> BoostProfile()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId);
            if (profile == null) return NotFound();

            profile.IsPremium = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Profile boosted successfully", IsPremium = true });
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<IActionResult> SearchProfiles(
            [FromQuery] string? gender,
            [FromQuery] string? religion,
            [FromQuery] string? community,
            [FromQuery] string? state,
            [FromQuery] string? city,
            [FromQuery] int? minAge,
            [FromQuery] int? maxAge,
            [FromQuery] string? motherTongue,
            [FromQuery] string? maritalStatus,
            [FromQuery] string? diet,
            [FromQuery] string? familyStatus,
            [FromQuery] int? minIncome,
            [FromQuery] bool? onlyVerified,
            [FromQuery] bool? onlyPremium)
        {
            var query = _context.Profiles
                .AsNoTracking()
                .Include(p => p.Photos)
                .Include(p => p.User)
                .Where(p => p.IsApproved && p.User.Email != "admin@vikan.com")
                .AsQueryable();

            var currentProfileId = GetCurrentProfileId();
            if (!string.IsNullOrEmpty(currentProfileId))
            {
                query = query.Where(p => p.Id != currentProfileId);
            }

            if (!string.IsNullOrEmpty(gender))
            {
                query = query.Where(p => p.Gender.ToLower() == gender.ToLower());
            }

            if (!string.IsNullOrEmpty(religion))
            {
                query = query.Where(p => p.Religion.ToLower() == religion.ToLower());
            }

            if (!string.IsNullOrEmpty(community))
            {
                query = query.Where(p => p.Community.ToLower() == community.ToLower());
            }

            if (!string.IsNullOrEmpty(state))
            {
                query = query.Where(p => p.State.ToLower() == state.ToLower());
            }

            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(p => p.City.ToLower() == city.ToLower());
            }

            if (minAge.HasValue)
            {
                var minDob = DateTime.UtcNow.Date.AddYears(-minAge.Value);
                query = query.Where(p => p.DateOfBirth <= minDob);
            }

            if (maxAge.HasValue)
            {
                var maxDob = DateTime.UtcNow.Date.AddYears(-(maxAge.Value + 1));
                query = query.Where(p => p.DateOfBirth >= maxDob);
            }

            var results = await query.ToListAsync();

            if (!string.IsNullOrEmpty(motherTongue))
            {
                results = results.Where(p => p.MotherTongue?.ToLower() == motherTongue.ToLower()).ToList();
            }

            if (!string.IsNullOrEmpty(maritalStatus))
            {
                results = results.Where(p => p.MaritalStatus?.ToLower() == maritalStatus.ToLower()).ToList();
            }

            if (!string.IsNullOrEmpty(diet))
            {
                results = results.Where(p => p.Diet?.ToLower() == diet.ToLower()).ToList();
            }

            if (!string.IsNullOrEmpty(familyStatus))
            {
                results = results.Where(p => p.FamilyStatus?.ToLower() == familyStatus.ToLower()).ToList();
            }

            if (onlyVerified.HasValue && onlyVerified.Value)
            {
                results = results.Where(p => p.IsVerified).ToList();
            }

            if (onlyPremium.HasValue && onlyPremium.Value)
            {
                results = results.Where(p => p.IsPremium).ToList();
            }

            if (minIncome.HasValue && minIncome.Value > 0)
            {
                results = results.Where(p => ParseSalaryToNumber(p.Salary) >= minIncome.Value).ToList();
            }

            return Ok(results.Select(profile => new
            {
                profile.Id,
                profile.UserId,
                profile.Name,
                profile.Gender,
                profile.DateOfBirth,
                profile.Religion,
                profile.Community,
                profile.MotherTongue,
                profile.MaritalStatus,
                profile.Education,
                profile.Occupation,
                profile.Salary,
                profile.State,
                profile.City,
                profile.Diet,
                profile.FamilyStatus,
                profile.FamilyType,
                profile.FamilyValues,
                profile.IsVerified,
                profile.IsPremium,
                profile.OnlineStatus,
                Photos = profile.Photos.Select(ph => ph.Url).ToList()
            }));
        }

        private static int ParseSalaryToNumber(string? salaryStr)
        {
            if (string.IsNullOrEmpty(salaryStr)) return 0;
            var clean = new string(salaryStr.Where(c => char.IsDigit(c) || c == '.').ToArray());
            if (!double.TryParse(clean, out var num)) return 0;

            if (salaryStr.Contains("crore", StringComparison.OrdinalIgnoreCase) || 
                salaryStr.Contains("cr", StringComparison.OrdinalIgnoreCase))
            {
                return (int)(num * 10000000);
            }
            if (salaryStr.Contains("lpa", StringComparison.OrdinalIgnoreCase) || 
                salaryStr.Contains("lakh", StringComparison.OrdinalIgnoreCase))
            {
                return (int)(num * 100000);
            }
            return (int)num;
        }

        [HttpGet("my/verification")]
        public async Task<IActionResult> GetMyVerifications()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var verifications = await _context.Verifications
                .AsNoTracking()
                .Where(v => v.ProfileId == profileId)
                .OrderByDescending(v => v.SubmittedAt)
                .ToListAsync();

            return Ok(verifications);
        }

        [HttpPost("my/verification")]
        public async Task<IActionResult> SubmitVerification([FromBody] SubmitVerificationRequest request)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var verification = new Verification
            {
                Id = Guid.NewGuid().ToString(),
                ProfileId = profileId,
                DocumentType = request.DocumentType,
                DocumentUrl = request.DocumentUrl,
                FaceScanUrl = request.FaceScanUrl,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            };

            _context.Verifications.Add(verification);
            await _context.SaveChangesAsync();

            return Ok(verification);
        }

        [HttpPost("{id}/view")]
        public async Task<IActionResult> RecordProfileView(string id)
        {
            var viewerProfileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(viewerProfileId)) return Unauthorized();

            if (viewerProfileId == id) return Ok(new { Message = "Self view ignored" });

            // Check if target profile exists
            var targetProfile = await _context.Profiles.FindAsync(id);
            if (targetProfile == null) return NotFound(new { Message = "Target profile not found" });

            // Upsert / refresh recent view
            var recentView = await _context.ProfileViews
                .FirstOrDefaultAsync(v => v.ViewerProfileId == viewerProfileId && v.ViewedProfileId == id);

            if (recentView != null)
            {
                recentView.ViewedAt = DateTime.UtcNow;
            }
            else
            {
                _context.ProfileViews.Add(new ProfileView
                {
                    ViewerProfileId = viewerProfileId,
                    ViewedProfileId = id,
                    ViewedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Profile view recorded" });
        }

        [HttpGet("my/visitors")]
        public async Task<IActionResult> GetMyVisitors()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var visitors = await _context.ProfileViews
                .AsNoTracking()
                .Where(v => v.ViewedProfileId == profileId && v.ViewerProfile.IsApproved)
                .OrderByDescending(v => v.ViewedAt)
                .Include(v => v.ViewerProfile)
                    .ThenInclude(p => p.Photos)
                .Take(25)
                .Select(v => new
                {
                    v.Id,
                    v.ViewedAt,
                    Profile = new
                    {
                        v.ViewerProfile.Id,
                        v.ViewerProfile.Name,
                        v.ViewerProfile.Gender,
                        v.ViewerProfile.DateOfBirth,
                        v.ViewerProfile.Religion,
                        v.ViewerProfile.Community,
                        v.ViewerProfile.Occupation,
                        v.ViewerProfile.City,
                        v.ViewerProfile.State,
                        v.ViewerProfile.IsVerified,
                        v.ViewerProfile.IsPremium,
                        Photos = v.ViewerProfile.Photos.Select(ph => ph.Url).ToList()
                    }
                })
                .ToListAsync();

            return Ok(visitors);
        }

        [HttpPost("{id}/shortlist/toggle")]
        public async Task<IActionResult> ToggleShortlist(string id)
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            if (profileId == id) return BadRequest(new { Message = "Cannot shortlist yourself" });

            var existing = await _context.ShortlistedProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == profileId && sp.ShortlistedProfileId == id);

            if (existing != null)
            {
                _context.ShortlistedProfiles.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { IsShortlisted = false, Message = "Profile removed from shortlist" });
            }

            var target = await _context.Profiles.FindAsync(id);
            if (target == null) return NotFound(new { Message = "Target profile not found" });

            _context.ShortlistedProfiles.Add(new ShortlistedProfile
            {
                UserId = profileId,
                ShortlistedProfileId = id,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { IsShortlisted = true, Message = "Profile added to shortlist" });
        }

        [HttpGet("my/shortlisted")]
        public async Task<IActionResult> GetMyShortlisted()
        {
            var profileId = GetCurrentProfileId();
            if (string.IsNullOrEmpty(profileId)) return Unauthorized();

            var shortlisted = await _context.ShortlistedProfiles
                .AsNoTracking()
                .Where(sp => sp.UserId == profileId && sp.TargetProfile.IsApproved)
                .OrderByDescending(sp => sp.CreatedAt)
                .Include(sp => sp.TargetProfile)
                    .ThenInclude(p => p.Photos)
                .Take(50)
                .Select(sp => new
                {
                    sp.Id,
                    sp.CreatedAt,
                    Profile = new
                    {
                        sp.TargetProfile.Id,
                        sp.TargetProfile.Name,
                        sp.TargetProfile.Gender,
                        sp.TargetProfile.DateOfBirth,
                        sp.TargetProfile.Religion,
                        sp.TargetProfile.Community,
                        sp.TargetProfile.Education,
                        sp.TargetProfile.Occupation,
                        sp.TargetProfile.Salary,
                        sp.TargetProfile.City,
                        sp.TargetProfile.State,
                        sp.TargetProfile.IsVerified,
                        sp.TargetProfile.IsPremium,
                        Photos = sp.TargetProfile.Photos.Select(ph => ph.Url).ToList()
                    }
                })
                .ToListAsync();

            return Ok(shortlisted);
        }
    }

    public class SubmitVerificationRequest
    {
        public string DocumentType { get; set; } = "Aadhar";
        public string DocumentUrl { get; set; } = null!;
        public string FaceScanUrl { get; set; } = null!;
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = null!;
        public string Education { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Diet { get; set; } = string.Empty;
        public string Smoking { get; set; } = string.Empty;
        public string Drinking { get; set; } = string.Empty;
        public string ParentsNumber { get; set; } = string.Empty;
        public string FamilyType { get; set; } = string.Empty;
        public string FamilyStatus { get; set; } = string.Empty;
        public string FamilyValues { get; set; } = string.Empty;
        public string FamilyDetails { get; set; } = string.Empty;
        public string AboutMe { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string MotherTongue { get; set; } = string.Empty;
        public string Religion { get; set; } = string.Empty;
        public string Community { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
    }

    public class PhotoUploadRequest
    {
        public string Url { get; set; } = null!;
    }

    public class DeletePhotoRequest
    {
        public string Url { get; set; } = null!;
    }

    public class SetPrimaryPhotoRequest
    {
        public string Url { get; set; } = null!;
    }
}
