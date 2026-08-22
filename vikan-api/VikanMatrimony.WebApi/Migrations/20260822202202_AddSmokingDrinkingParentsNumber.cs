using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VikanMatrimony.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSmokingDrinkingParentsNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Drinking",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ParentsNumber",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Smoking",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Drinking",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ParentsNumber",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Smoking",
                table: "Profiles");
        }
    }
}
