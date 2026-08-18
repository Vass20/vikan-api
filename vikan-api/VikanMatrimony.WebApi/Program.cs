using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
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

// Register PostgreSQL Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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
});

builder.Services.AddScoped<IEmailService, EmailService>();

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

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.DocExpansion(DocExpansion.None);
});

app.UseCors(policy => policy
    .WithOrigins("http://localhost:3000") // Matches standard frontend Next.js URL
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

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
 
        // Enforce: only display premium if the user has purchased a membership plan (Non-Free)
        var freeProfiles = context.Profiles.Where(p => p.MembershipType == "Free" || string.IsNullOrEmpty(p.MembershipType) || p.MembershipType == "Free Package" || p.MembershipType == "Free Member").ToList();
        foreach (var p in freeProfiles)
        {
            p.IsPremium = false;
            p.MembershipType = "Free";
        }
        context.SaveChanges();
    }

app.Run();
