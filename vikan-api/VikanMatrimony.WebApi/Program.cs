using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text;
using VikanMatrimony.WebApi.Data;
using VikanMatrimony.WebApi.Hubs;
using VikanMatrimony.WebApi.Models;
using VikanMatrimony.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Disable reloadOnChange to prevent inotify exhaustion in container/cloud environments
builder.Configuration.Sources.Clear();
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();

// Register PostgreSQL Database Context with Connection Pooling
builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-client";
        return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 150, // allow 150 requests per 10 seconds per IP
            QueueLimit = 10,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            Window = TimeSpan.FromSeconds(10)
        });
    });
});

// Configure ASP.NET Core Identity with flexible password rules for demo environments
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "VikanMatrimonySuperSecretLongJWTAuthenticationSecurityKey123!";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "VikanMatrimonyBackend",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "VikanMatrimonyFrontend",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our chathub, extract token from query string
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && 
                path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHttpClient();

builder.Services.AddSignalR();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Configure Swagger Documentation with Authorization Locks
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Vikan Matrimony API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

var app = builder.Build();

// Enable Forwarded Headers first to support reverse proxy load balancing
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Enable Response Compression
app.UseResponseCompression();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.DocExpansion(DocExpansion.None);
});

app.UseCors(policy => policy
    .SetIsOriginAllowed(origin => 
    {
        var uri = new Uri(origin);
        return uri.Host == "localhost" || uri.Host == "vikan-seven.vercel.app" || uri.Host.EndsWith(".vercel.app");
    })
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

// Apply global rate limiting before auth to protect resources
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();
app.MapControllers();
app.MapHub<ChatHub>("/chathub");

// Seed Admin User
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Automatically apply any pending EF migrations on startup
    context.Database.Migrate();

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    var adminEmail = "admin@vikan.com";
    var adminUser = userManager.FindByEmailAsync(adminEmail).GetAwaiter().GetResult();
    if (adminUser == null)
    {
        adminUser = new User
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true
        };
        var result = userManager.CreateAsync(adminUser, "Vikan@123").GetAwaiter().GetResult();
        if (result.Succeeded)
        {
            var adminProfile = new Profile
            {
                UserId = adminUser.Id,
                Name = "System Administrator",
                Gender = "Male",
                DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 1, 1), DateTimeKind.Utc),
                Religion = "Universal",
                Community = "System",
                MotherTongue = "English",
                City = "Mumbai",
                State = "Maharashtra",
                Education = "Ph.D. Administration",
                Occupation = "Matrimonial Administrator",
                Salary = "N/A",
                IsVerified = true,
                IsApproved = true,
                ApprovalStatus = "Approved",
                IsPremium = false,
                MembershipType = "Free"
            };
            context.Profiles.Add(adminProfile);
            context.SaveChanges();
        }
    }

    // Seed / Ensure Test User with Gold Membership
    var testEmail = "test@gmail.com";
    var testUser = userManager.FindByEmailAsync(testEmail).GetAwaiter().GetResult();
    if (testUser == null)
    {
        testUser = new User
        {
            UserName = testEmail,
            Email = testEmail,
            EmailConfirmed = true
        };
        var createRes = userManager.CreateAsync(testUser, "Demo@123").GetAwaiter().GetResult();
        if (createRes.Succeeded)
        {
            var testProfile = new Profile
            {
                UserId = testUser.Id,
                Name = "Test Gold Member",
                Gender = "Male",
                DateOfBirth = DateTime.SpecifyKind(new DateTime(1995, 5, 15), DateTimeKind.Utc),
                Religion = "Hindu",
                Community = "Vanniyar",
                MotherTongue = "Tamil",
                City = "Chennai",
                State = "Tamil Nadu",
                Education = "B.Tech Computer Science",
                Occupation = "Software Engineer",
                Salary = "12-15 LPA",
                IsVerified = true,
                IsApproved = true,
                ApprovalStatus = "Approved",
                IsPremium = true,
                MembershipType = "Gold Member"
            };
            context.Profiles.Add(testProfile);
            context.SaveChanges();
        }
    }
    else
    {
        var testProfile = context.Profiles.FirstOrDefault(p => p.UserId == testUser.Id);
        if (testProfile != null)
        {
            testProfile.MembershipType = "Gold Member";
            testProfile.IsPremium = true;
            testProfile.IsApproved = true;
            testProfile.ApprovalStatus = "Approved";
            testProfile.IsVerified = true;
            context.SaveChanges();
        }
    }

    // Seed Castes
        if (!context.Castes.Any())
        {
            var castes = new List<Caste>();
            
            // Hindu
            var hinduCastes = new[] {
                "Adi Dravidar (SC)", "Agamudayar", "Arunthathiyar", "Ayira Vysya", "Balija Naidu",
                "Brahmin - Iyer", "Brahmin - Iyengar", "Brahmin - Other", "Chettiar", "Devendra Kula Vellalar",
                "Gounder", "Kongu Vellala Gounder", "Mudaliyar", "Nadar", "Naicker / Naidu", "Pillai",
                "Reddy", "Saurashtra", "Senai Thalaivar", "Thevar", "Kallar", "Maravar", "Udaiyar",
                "Vanniyar", "Vellalar", "Viswakarma", "Yadava (Konar)", "Others"
            };
            foreach (var c in hinduCastes) castes.Add(new Caste { Religion = "Hindu", Name = c });

            // Muslim
            var muslimCastes = new[] {
                "Labbai", "Maraikayar", "Rowther", "Sunni", "Shia", "Dudekula", "Others"
            };
            foreach (var c in muslimCastes) castes.Add(new Caste { Religion = "Muslim", Name = c });

            // Christian
            var christianCastes = new[] {
                "Roman Catholic", "CSI", "Pentecostal", "Protestant", "Latin Catholic",
                "Nadar Christian", "Scheduled Caste Christian", "Others"
            };
            foreach (var c in christianCastes) castes.Add(new Caste { Religion = "Christian", Name = c });

            context.Castes.AddRange(castes);
            context.SaveChanges();
        }
 
        // Enforce: update specified users to Silver Member
        var silverEmails = new[] { "vasanthlf2020@gmail.com", "alancaptsee@gmail.com" };
        foreach (var email in silverEmails)
        {
            var cleanEmail = email.Trim().ToLower();
            var profilesToUpdate = context.Profiles.Include(p => p.User).Where(p => p.User != null && p.User.Email != null && p.User.Email.ToLower() == cleanEmail).ToList();
            foreach (var prof in profilesToUpdate)
            {
                prof.MembershipType = "Silver Member";
                prof.IsPremium = true;
            }
        }
        context.SaveChanges();

        // Enforce: only display premium if the user has purchased a membership plan (Non-Free)
        var freeProfiles = context.Profiles.Include(p => p.User).Where(p => (p.MembershipType == "Free" || string.IsNullOrEmpty(p.MembershipType) || p.MembershipType == "Free Package" || p.MembershipType == "Free Member") && (p.User == null || p.User.Email == null || !silverEmails.Contains(p.User.Email.ToLower()))).ToList();
        foreach (var p in freeProfiles)
        {
            p.IsPremium = false;
            p.MembershipType = "Free";
        }
        context.SaveChanges();
    }

app.Run();
