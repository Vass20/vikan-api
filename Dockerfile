FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["vikan-api/VikanMatrimony.WebApi/VikanMatrimony.WebApi.csproj", "vikan-api/VikanMatrimony.WebApi/"]
RUN dotnet restore "vikan-api/VikanMatrimony.WebApi/VikanMatrimony.WebApi.csproj"

# Copy the remaining files and build the app
COPY . .
WORKDIR "/src/vikan-api/VikanMatrimony.WebApi"
RUN dotnet build "VikanMatrimony.WebApi.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "VikanMatrimony.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install system dependencies for .NET Core features (GSSAPI/Kerberos SMTP and Globalization)
RUN apk add --no-cache krb5-libs icu-libs

# Expose port and start the application
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENTRYPOINT ["dotnet", "VikanMatrimony.WebApi.dll"]
