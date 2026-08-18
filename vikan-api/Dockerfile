FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["VikanMatrimony.WebApi/VikanMatrimony.WebApi.csproj", "VikanMatrimony.WebApi/"]
RUN dotnet restore "VikanMatrimony.WebApi/VikanMatrimony.WebApi.csproj"

# Copy the remaining files and build the app
COPY . .
WORKDIR "/src/VikanMatrimony.WebApi"
RUN dotnet build "VikanMatrimony.WebApi.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "VikanMatrimony.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port and start the application
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENTRYPOINT ["dotnet", "VikanMatrimony.WebApi.dll"]
