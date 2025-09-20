
class AuthService {
    constructor() {
        this.clientID = "87211968-35ee-4f60-a785-b2f52cc1a9ce";
        this.clientSecret = "dSFNjWdnpAbwyVEn";
        this.accessCode = "rDnezf";
        this.email = "saurabhparmar205@gmail.com";
        this.rollNo = "25162";
        this.cachedToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.cachedToken;
        }

        try {
            const tokenResponse = await this.refreshToken();
            this.cachedToken = tokenResponse.access_token;
            this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000 * 0.9);
            return this.cachedToken;
        } catch (error) {
            console.error('Failed to get access token:', error);
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYXVyYWJocGFybWFyMjA1QGdtYWlsLmNvbSIsImV4cCI6MTc1ODM1MTgzOSwiaWF0IjoxNzU4MzUwOTM5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMDU5N2YyMmItOTJlNi00MDAzLWFlODUtOGNhNzExZTcwNzQ1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2F1cmFiaCBzaW5naCBwYXJtYXIiLCJzdWIiOiI4NzIxMTk2OC0zNWVlLTRmNjAtYTc4NS1iMmY1MmNjMWE5Y2UifSwiZW1haWwiOiJzYXVyYWJocGFybWFyMjA1QGdtYWlsLmNvbSIsIm5hbWUiOiJzYXVyYWJoIHNpbmdoIHBhcm1hciIsInJvbGxObyI6IjI1MTYyIiwiYWNjZXNzQ29kZSI6InJEbmV6ZiIsImNsaWVudElEIjoiODcyMTE5NjgtMzVlZS00ZjYwLWE3ODUtYjJmNTJjYzFhOWNlIiwiY2xpZW50U2VjcmV0IjoiZFNGTmpXZG5wQWJ3eVZFbiJ9.UURdH2tBQ1AZPmiWJPwHIr5Qounjh5ZMuXhuMZ4HhxY";
        }
    }

    async refreshToken() {
        throw new Error("Token refresh not implemented - using static token");
    }
}

module.exports = new AuthService();