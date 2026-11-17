import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BacenClient {
  private baseUrl = 'https://auth.sandbox.openfinance.br'; // Sandbox

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.BACEN_CLIENT_ID || '',
      redirect_uri: `${process.env.BACKEND_URL}/open-finance/callback`,
      response_type: 'code',
      scope: 'openid accounts transactions',
      state: Math.random().toString(36).substring(7),
    });
    return `${this.baseUrl}/auth?${params}`;
  }

  async exchangeCodeForToken(code: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/token`, {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.BACEN_CLIENT_ID,
        client_secret: process.env.BACEN_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/open-finance/callback`,
      });
      return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token };
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw error;
    }
  }

  async fetchAccounts(accessToken: string) {
    try {
      const response = await axios.get('https://api.sandbox.openfinance.br/open-banking/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch accounts failed:', error);
      return [];
    }
  }

  async fetchTransactions(accessToken: string, accountId: string) {
    try {
      const response = await axios.get(
        `https://api.sandbox.openfinance.br/open-banking/v1/accounts/${accountId}/transactions`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch transactions failed:', error);
      return [];
    }
  }
}
