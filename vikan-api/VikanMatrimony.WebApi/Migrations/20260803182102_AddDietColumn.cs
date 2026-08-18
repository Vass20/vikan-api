using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddDietColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Diet",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Diet",
                table: "Profiles");
        }
    }
}
