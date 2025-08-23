/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

interface User {
  id: numbe
  name: string;
  email?: string;
  phone?: string;
  region: string;
  role: 'user' | 'issuer' | 'admin';
  isVerified: boolean;
}

interface Reg
  name: string;
  email?: string;
  phone?: string;
  password: string;
 ng;
}

interface LoginRnse {
 ;
  token: string;
}

interface ApiRespon
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    [];
 
}


  private baseURLg;

  c
    this.baseURL = process.env.4000';
  }

  private async mt<T>(
    endpoint: string,
    it = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/authnt}`;
    
ring> = {
      'Content-Type': 'application
    };

    const token = localStorage.getItem('auth_token');
    i{
      defaultHeaders.Authorizatioken}`;
    }

    const config: RequestI
      ...options,
      he: {
      Headers,
s,
      },
    };

    try {
      const response = awg);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.erroor);
     rror;
   }
  }

  async register(userData: Re
    const respons {
      method: 'POST',
    
    });

    if{

      localStorage.setItem('user',er));
      return response.data;
    }

    t
  }

  async login(emnse> {
    const response = awaitn', {
      method: 'POST',
      bord }),
    })

    if (r
      localStorage.setItem('auth_token', respons
      localStorage.setItem('user', JSON.stringify(responsr));
data;
    }

    thr
  }

  async
    try {
      await this.make
        method: 'POST',
      });
    } (error) {
   rror);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.re
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response ('/me');
      
      if (response.success && res
        localStor;
        r
      }
    {
      console.error('Failed to get current user:', error);
      this.logout();
    }

    return null;
  }

  async reque{
    const resd', {
      met,
      b
    });

    if (!response.success) {
    ed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const res', {
      met
      brd }),
    });

    if (!response.success) {
      throw new Error;
    }
  }

  async{
   
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    

    if (response.succa) {
      localStorage.setItem('oken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return a;
    }

    thriled');
  }

  async changePassword(currentPassword: string, newPassword:oid> {
    const response = await this.makeRequest<Ad', {
     'POST',
      bod }),
    });

    if (!respon
      throw new Error(resp;
    }
  }

  getSt{
    t{
   ser');
      return userStr ? JSON.parse(use;
    } catch (error) {
      console.error('Failor);
   n null;
    }
  }

  getStoredToken(): string | null {
    ret
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

exp
export type { User, RegisterData, LoginResponse, ApiResponse };