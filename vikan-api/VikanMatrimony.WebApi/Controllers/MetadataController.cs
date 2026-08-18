using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VikanMatrimony.WebApi.Data;

namespace VikanMatrimony.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class MetadataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MetadataController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("castes")]
        public async Task<IActionResult> GetCastes()
        {
            var castes = await _context.Castes.ToListAsync();
            var grouped = castes
                .GroupBy(c => c.Religion)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(c => c.Name).ToList()
                );

            return Ok(grouped);
        }
    }
}
